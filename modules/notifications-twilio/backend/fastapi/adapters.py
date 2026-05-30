"""notifications-twilio — FastAPI async SMS channel via Twilio.

The Twilio python SDK is sync; we wrap each call in ``asyncio.to_thread``
to satisfy the async NotificationAdapter ABC without blocking the loop.
"""
import asyncio
import os
from typing import Any
from uuid import uuid4

from app.notifications.adapters import NotificationAdapter, register_adapter


# Lazy import — module loads in test envs without twilio installed.
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
    """Test hook — inject a fake exposing ``messages.create``."""
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

    async def send(
        self, recipient: str, template: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        # Render a minimal text body — Phase 4 plugs in the templates registry.
        body = data.get("body") or _format_body(template, data)

        kwargs: dict[str, Any] = {"to": recipient, "body": body}
        if self.messaging_service_sid:
            kwargs["messaging_service_sid"] = self.messaging_service_sid
        elif self.from_number:
            kwargs["from_"] = self.from_number

        try:
            msg = await asyncio.to_thread(_client().messages.create, **kwargs)
            sid = getattr(msg, "sid", None) or uuid4().hex
            status = getattr(msg, "status", "queued")
            return {"id": sid, "status": _normalize_status(status)}
        except Exception as exc:  # noqa: BLE001
            return {"id": uuid4().hex, "status": "failed", "error": str(exc)}


def _format_body(template: str, data: dict[str, Any]) -> str:
    pairs = ", ".join(f"{k}={v}" for k, v in data.items())
    return f"[{template}] {pairs}".strip()


def _normalize_status(twilio_status: str) -> str:
    """Map Twilio's lifecycle states to NotificationLog's coarse buckets."""
    if twilio_status in {"delivered", "sent", "received"}:
        return "sent"
    if twilio_status in {"queued", "accepted", "sending"}:
        return "sent"  # accepted by carrier; webhook updates later
    if twilio_status in {"failed", "undelivered"}:
        return "failed"
    return twilio_status


def install_default() -> None:
    """Register TwilioSmsAdapter for the ``sms`` channel."""
    register_adapter(TwilioSmsAdapter())
