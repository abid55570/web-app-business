"""Razorpay webhook handler.

Razorpay POSTs lifecycle events to /api/webhooks/razorpay with
X-Razorpay-Signature = HMAC-SHA256(body, webhook_secret). Verify, dedupe
on payload id, dispatch onto in-process bus.
"""
import hashlib
import hmac
import json
import os
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.events_bus.bus import emit


router = APIRouter()

_seen_event_ids: set[str] = set()


def reset_seen_event_ids() -> None:
    _seen_event_ids.clear()


def _verify(payload: bytes, signature: str) -> None:
    secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "").encode("utf-8")
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, signature):
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_INVALID_SIGNATURE",
                "message": "Razorpay signature mismatch.",
            },
        )


@router.post("/razorpay", status_code=200)
async def razorpay_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    signature: Annotated[
        str | None, Header(alias="X-Razorpay-Signature")
    ] = None,
):
    if not signature:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_MISSING_SIGNATURE",
                "message": "X-Razorpay-Signature header is required.",
            },
        )

    payload = await request.body()
    _verify(payload, signature)

    try:
        event: dict[str, Any] = json.loads(payload.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail={"code": "WEBHOOK_BAD_JSON", "message": "Body not JSON."},
        )

    event_id = event.get("id") or event.get("event_id") or ""
    if event_id and event_id in _seen_event_ids:
        return {"received": True, "duplicate": True}
    if event_id:
        _seen_event_ids.add(event_id)

    event_type = event.get("event", "")
    payment_obj = (
        event.get("payload", {}).get("payment", {}).get("entity", {})
    )

    if event_type == "payment.captured":
        await emit(
            "payment.succeeded",
            {
                "intentId": payment_obj.get("order_id", ""),
                "transactionId": payment_obj.get("id", ""),
                "amount": (payment_obj.get("amount", 0) or 0) / 100,
                "currency": (payment_obj.get("currency") or "").upper(),
            },
            db,
        )
    elif event_type == "payment.failed":
        await emit(
            "payment.failed",
            {
                "intentId": payment_obj.get("order_id", ""),
                "reason": payment_obj.get("error_description")
                or "Unknown failure.",
            },
            db,
        )
    elif event_type == "refund.processed":
        refund_obj = (
            event.get("payload", {}).get("refund", {}).get("entity", {})
        )
        await emit(
            "payment.refunded",
            {
                "transactionId": refund_obj.get("payment_id", ""),
                "amount": (refund_obj.get("amount", 0) or 0) / 100,
            },
            db,
        )

    return {"received": True}
