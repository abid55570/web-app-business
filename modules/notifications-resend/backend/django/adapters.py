"""notifications-resend — Django sync email adapter via Resend.

Sync mirror of the FastAPI adapter; same channel name ("email") so the
notifications.service.dispatch() lookup keeps working.
"""
import os
from typing import Any
from uuid import uuid4

from notifications.adapters import NotificationAdapter, register_adapter


_resend_module: Any | None = None


def _resend() -> Any:
    global _resend_module
    if _resend_module is None:
        import resend  # type: ignore

        resend.api_key = os.environ.get("RESEND_API_KEY", "")
        _resend_module = resend
    return _resend_module


def register_resend_for_tests(fake: Any) -> None:
    global _resend_module
    _resend_module = fake


class ResendEmailAdapter(NotificationAdapter):
    name = "resend"
    channel = "email"

    def __init__(
        self,
        from_address: str = "no-reply@example.com",
        from_name: str = "",
    ) -> None:
        self.from_address = from_address
        self.from_name = from_name

    def send(self, recipient, template, data):
        from_field = (
            f"{self.from_name} <{self.from_address}>"
            if self.from_name
            else self.from_address
        )
        body = "\n".join(f"{k}: {v}" for k, v in data.items())
        try:
            res = _resend().Emails.send(
                {
                    "from": from_field,
                    "to": [recipient],
                    "subject": template,
                    "text": body,
                }
            )
            return {"id": res.get("id", uuid4().hex), "status": "sent"}
        except Exception as exc:  # noqa: BLE001
            return {"id": uuid4().hex, "status": "failed", "error": str(exc)}


def install_default() -> None:
    register_adapter(ResendEmailAdapter())
