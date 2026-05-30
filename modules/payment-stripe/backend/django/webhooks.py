"""Stripe webhook handler — Django sync mirror of the FastAPI version.

Same contract: verify Stripe-Signature, dedupe on event id, emit on the
in-process bus.
"""
import os
from typing import Any

from events_bus.bus import emit
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


_seen_event_ids: set[str] = set()


def reset_seen_event_ids() -> None:
    _seen_event_ids.clear()


def _stripe() -> Any:
    """Delegate every call to adapters.py so test fakes propagate."""
    from payment_stripe import adapters as _adapters

    return _adapters._stripe()  # noqa: SLF001


def register_stripe_for_tests(fake: Any) -> None:
    """Test hook — re-uses adapter's swap. Both surfaces (adapter ops +
    webhook signature verify) share the same fake module."""
    from payment_stripe import adapters as _adapters

    _adapters.register_stripe_for_tests(fake)


class StripeWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        signature = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        if not signature:
            return Response(
                {
                    "code": "WEBHOOK_MISSING_SIGNATURE",
                    "message": "Stripe-Signature header is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        secret = os.environ.get("STRIPE_WEBHOOK_SECRET", "")
        try:
            event = _stripe().Webhook.construct_event(
                payload=request.body,
                sig_header=signature,
                secret=secret,
            )
        except Exception as exc:  # noqa: BLE001
            return Response(
                {"code": "WEBHOOK_INVALID_SIGNATURE", "message": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_id = (
            event.get("id")
            if isinstance(event, dict)
            else getattr(event, "id", None)
        )
        if event_id and event_id in _seen_event_ids:
            return Response({"received": True, "duplicate": True})
        if event_id:
            _seen_event_ids.add(event_id)

        event_type = (
            event.get("type")
            if isinstance(event, dict)
            else getattr(event, "type", "")
        )
        data_obj = (
            event.get("data", {}).get("object", {})
            if isinstance(event, dict)
            else event.data.object
        )

        if event_type == "payment_intent.succeeded":
            emit(
                "payment.succeeded",
                {
                    "intentId": data_obj.get("id"),
                    "transactionId": data_obj.get("id"),
                    "amount": (data_obj.get("amount", 0) or 0) / 100,
                    "currency": (data_obj.get("currency") or "").upper(),
                },
            )
        elif event_type == "payment_intent.payment_failed":
            emit(
                "payment.failed",
                {
                    "intentId": data_obj.get("id"),
                    "reason": (data_obj.get("last_payment_error") or {}).get(
                        "message", "Unknown payment failure."
                    ),
                },
            )
        elif event_type == "charge.refunded":
            emit(
                "payment.refunded",
                {
                    "transactionId": data_obj.get("payment_intent")
                    or data_obj.get("id"),
                    "amount": (data_obj.get("amount_refunded", 0) or 0) / 100,
                },
            )

        return Response({"received": True})
