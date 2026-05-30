"""notifications-twilio — Django sync SMS adapter via Twilio.

Sync mirror of the FastAPI adapter; same channel name ("sms") so the
notifications.service.dispatch() lookup keeps working.
"""
import os
from typing import Any
from uuid import uuid4

from notifications.adapters import NotificationAdapter, register_adapter


_twilio_client: Any | None = None


def _client() -> Any:
    global _twilio_client
    if _twilio_client is None:
        from twilio.rest import Client  # type: ignore

        sid = os.environ.get("TWILIO_ACCOUNT_SID", "")
        token = os.environ.get("TWILIO_AUTH_TOKEN", "")
        _twilio_client = Client(sid, token)
    return _twilio_client


def register_twilio_for_tests(fake: Any) -> None:
    global _twilio_client
    _twilio_client = fake


class TwilioSmsAdapter(NotificationAdapter):
    name = "twilio"
    channel = "sms"

    def __init__(
        self,
        from_number: str = "",
        messaging_service_sid: str = "",
    ) -> None:
        self.from_number = from_number
        self.messaging_service_sid = messaging_service_sid

    def send(self, recipient, template, data):
        body = data.get("body") or _format_body(template, data)

        kwargs: dict[str, Any] = {"to": recipient, "body": body}
        if self.messaging_service_sid:
            kwargs["messaging_service_sid"] = self.messaging_service_sid
        elif self.from_number:
            kwargs["from_"] = self.from_number

        try:
            msg = _client().messages.create(**kwargs)
            sid = getattr(msg, "sid", None) or uuid4().hex
            status = getattr(msg, "status", "queued")
            return {"id": sid, "status": _normalize_status(status)}
        except Exception as exc:  # noqa: BLE001
            return {"id": uuid4().hex, "status": "failed", "error": str(exc)}


def _format_body(template: str, data: dict[str, Any]) -> str:
    pairs = ", ".join(f"{k}={v}" for k, v in data.items())
    return f"[{template}] {pairs}".strip()


def _normalize_status(twilio_status: str) -> str:
    if twilio_status in {"delivered", "sent", "received"}:
        return "sent"
    if twilio_status in {"queued", "accepted", "sending"}:
        return "sent"
    if twilio_status in {"failed", "undelivered"}:
        return "failed"
    return twilio_status


def install_default() -> None:
    register_adapter(TwilioSmsAdapter())
