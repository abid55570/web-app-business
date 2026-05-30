"""Twilio status callback — Django sync mirror."""
import base64
import hashlib
import hmac
import os

from notifications.models import NotificationLog
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView


_STATUS_MAP = {
    "queued": "sent",
    "sent": "sent",
    "delivered": "sent",
    "undelivered": "failed",
    "failed": "failed",
}


def _verify(
    auth_token: str, url: str, params: dict[str, str], signature: str
) -> bool:
    payload = url + "".join(k + params[k] for k in sorted(params.keys()))
    digest = hmac.new(
        auth_token.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha1,
    ).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)


class TwilioStatusView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        signature = request.META.get("HTTP_X_TWILIO_SIGNATURE", "")
        if not signature:
            return Response(
                {
                    "code": "WEBHOOK_MISSING_SIGNATURE",
                    "message": "X-Twilio-Signature header is required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        params = {k: str(v) for k, v in request.POST.items()}
        url = request.build_absolute_uri()
        if not _verify(
            os.environ.get("TWILIO_AUTH_TOKEN", ""),
            url,
            params,
            signature,
        ):
            return Response(
                {
                    "code": "WEBHOOK_INVALID_SIGNATURE",
                    "message": "Twilio signature mismatch.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        sid = params.get("MessageSid", "")
        twilio_status = params.get("MessageStatus", "")
        new_status = _STATUS_MAP.get(twilio_status)
        if sid and new_status:
            updates: dict[str, str] = {"status": new_status}
            if twilio_status in ("undelivered", "failed"):
                updates["error"] = (
                    params.get("ErrorMessage") or "delivery failed"
                )
            NotificationLog.objects.filter(provider_id=sid).update(**updates)
        return Response({"received": True, "status": twilio_status})
