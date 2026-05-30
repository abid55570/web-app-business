"""Stripe webhook handler.

Stripe POSTs PaymentIntent / charge lifecycle events to ``/api/webhooks/stripe``.
We:
  1. Verify the Stripe-Signature header against STRIPE_WEBHOOK_SECRET
     (rejects forgeries + replays older than the tolerance window).
  2. Dispatch known event types onto the in-process bus so notifications,
     order status updaters, etc. can react.
  3. Dedupe by Stripe's event id (Stripe retries on non-2xx; we don't
     want to fan-out twice). The in-memory set is a stop-gap — production
     swaps for Redis/DB-backed dedupe.
"""
import os
from typing import Any

from fastapi import APIRouter, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated
from fastapi import Depends

from app.database import get_db
from app.events_bus.bus import emit


router = APIRouter()


# In-memory replay guard. Wipes on restart — fine for at-least-once
# semantics (Stripe events are themselves idempotent on the consumer side
# if downstream handlers are idempotent). PLAN §13 assumes the bus + sub-
# scribers tolerate occasional repeats.
_seen_event_ids: set[str] = set()


def reset_seen_event_ids() -> None:
    """Test hook — clears the dedupe set between tests."""
    _seen_event_ids.clear()


def _stripe() -> Any:
    """Delegate to the adapters module's stripe slot every call so the
    test fake registered via ``register_stripe_for_tests`` is picked up
    immediately. (Webhooks module deliberately doesn't cache its own
    handle — would shadow per-test swaps.)"""
    from app.payment_stripe import adapters as _adapters

    return _adapters._stripe()  # noqa: SLF001


def _construct_event(payload: bytes, signature: str) -> Any:
    """Raise ``HTTPException(400)`` on bad signature; return parsed event."""
    secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
    try:
        return _stripe().Webhook.construct_event(
            payload=payload,
            sig_header=signature,
            secret=secret,
        )
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(
            status_code=400,
            detail={"code": "WEBHOOK_INVALID_SIGNATURE", "message": str(exc)},
        )


@router.post("/stripe", status_code=200)
async def stripe_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    stripe_signature: Annotated[str | None, Header(alias="Stripe-Signature")] = None,
):
    if not stripe_signature:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_MISSING_SIGNATURE",
                "message": "Stripe-Signature header is required.",
            },
        )

    payload = await request.body()
    event = _construct_event(payload, stripe_signature)

    event_id = event.get("id") if isinstance(event, dict) else getattr(event, "id", None)
    if event_id and event_id in _seen_event_ids:
        return {"received": True, "duplicate": True}
    if event_id:
        _seen_event_ids.add(event_id)

    event_type = (
        event.get("type") if isinstance(event, dict) else getattr(event, "type", "")
    )
    data_obj = (
        event.get("data", {}).get("object", {})
        if isinstance(event, dict)
        else getattr(event, "data", {}).object
    )

    if event_type == "payment_intent.succeeded":
        await emit(
            "payment.succeeded",
            {
                "intentId": data_obj.get("id"),
                "transactionId": data_obj.get("id"),
                "amount": (data_obj.get("amount", 0) or 0) / 100,
                "currency": (data_obj.get("currency") or "").upper(),
            },
            db,
        )
    elif event_type == "payment_intent.payment_failed":
        await emit(
            "payment.failed",
            {
                "intentId": data_obj.get("id"),
                "reason": (data_obj.get("last_payment_error") or {}).get(
                    "message", "Unknown payment failure."
                ),
            },
            db,
        )
    elif event_type == "charge.refunded":
        await emit(
            "payment.refunded",
            {
                "transactionId": data_obj.get("payment_intent") or data_obj.get("id"),
                "amount": (data_obj.get("amount_refunded", 0) or 0) / 100,
            },
            db,
        )

    return {"received": True}
