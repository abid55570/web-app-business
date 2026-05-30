"""Razorpay webhook — Django sync mirror."""
import hashlib
import hmac
import json
import os

from events_bus.bus import emit
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


_seen_event_ids: set[str] = set()


def reset_seen_event_ids() -> None:
    _seen_event_ids.clear()


def _verify(payload: bytes, signature: str) -> bool:
    secret = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "").encode("utf-8")
    expected = hmac.new(secret, payload, hashlib.sha256).hexdigest()
    return hmac.compare_digest(expected, signature)


class RazorpayWebhookView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        signature = request.META.get("HTTP_X_RAZORPAY_SIGNATURE", "")
        if not signature:
            return Response(
                {
                    "code": "WEBHOOK_MISSING_SIGNATURE",
                    "message": "X-Razorpay-Signature header is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not _verify(request.body, signature):
            return Response(
                {
                    "code": "WEBHOOK_INVALID_SIGNATURE",
                    "message": "Razorpay signature mismatch.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            event = json.loads(request.body.decode("utf-8"))
        except json.JSONDecodeError:
            return Response(
                {"code": "WEBHOOK_BAD_JSON", "message": "Body not JSON."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        event_id = event.get("id") or event.get("event_id") or ""
        if event_id and event_id in _seen_event_ids:
            return Response({"received": True, "duplicate": True})
        if event_id:
            _seen_event_ids.add(event_id)

        event_type = event.get("event", "")
        payment_obj = (
            event.get("payload", {}).get("payment", {}).get("entity", {})
        )

        if event_type == "payment.captured":
            emit(
                "payment.succeeded",
                {
                    "intentId": payment_obj.get("order_id", ""),
                    "transactionId": payment_obj.get("id", ""),
                    "amount": (payment_obj.get("amount", 0) or 0) / 100,
                    "currency": (payment_obj.get("currency") or "").upper(),
                },
            )
        elif event_type == "payment.failed":
            emit(
                "payment.failed",
                {
                    "intentId": payment_obj.get("order_id", ""),
                    "reason": payment_obj.get("error_description")
                    or "Unknown failure.",
                },
            )
        elif event_type == "refund.processed":
            refund_obj = (
                event.get("payload", {}).get("refund", {}).get("entity", {})
            )
            emit(
                "payment.refunded",
                {
                    "transactionId": refund_obj.get("payment_id", ""),
                    "amount": (refund_obj.get("amount", 0) or 0) / 100,
                },
            )

        return Response({"received": True})
