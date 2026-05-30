"""WhatsApp Cloud webhook — Django sync mirror."""
import hashlib
import hmac
import json
import os

from django.http import HttpResponse
from notifications.models import NotificationLog
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


_STATUS_MAP = {
    "sent": "sent",
    "delivered": "sent",
    "read": "sent",
    "failed": "failed",
}


def _verify(payload: bytes, signature: str) -> bool:
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(
        os.environ.get("WHATSAPP_APP_SECRET", "").encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature[len("sha256=") :])


class WhatsappWebhookView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response | HttpResponse:
        mode = request.query_params.get("hub.mode", "")
        token = request.query_params.get("hub.verify_token", "")
        challenge = request.query_params.get("hub.challenge", "")
        expected = os.environ.get("WHATSAPP_VERIFY_TOKEN", "")
        if mode == "subscribe" and token == expected:
            return HttpResponse(challenge, content_type="text/plain")
        return Response(
            {
                "code": "WEBHOOK_VERIFY_FAILED",
                "message": "hub.verify_token mismatch or missing.",
            },
            status=status.HTTP_403_FORBIDDEN,
        )

    def post(self, request: Request) -> Response:
        signature = request.META.get("HTTP_X_HUB_SIGNATURE_256", "")
        if not signature:
            return Response(
                {
                    "code": "WEBHOOK_MISSING_SIGNATURE",
                    "message": "X-Hub-Signature-256 header is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        if not _verify(request.body, signature):
            return Response(
                {
                    "code": "WEBHOOK_INVALID_SIGNATURE",
                    "message": "WhatsApp signature mismatch.",
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

        updated = 0
        for entry in event.get("entry", []) or []:
            for change in entry.get("changes", []) or []:
                value = change.get("value", {}) or {}
                for st in value.get("statuses", []) or []:
                    wamid = st.get("id", "")
                    wstatus = st.get("status", "")
                    new_status = _STATUS_MAP.get(wstatus)
                    if not (wamid and new_status):
                        continue
                    updates = {"status": new_status}
                    if wstatus == "failed":
                        errors = st.get("errors") or []
                        updates["error"] = (errors[0] if errors else {}).get(
                            "title", "delivery failed"
                        )
                    n = NotificationLog.objects.filter(
                        provider_id=wamid
                    ).update(**updates)
                    updated += n
        return Response({"received": True, "updated": updated})
