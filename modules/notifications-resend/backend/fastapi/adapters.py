"""notifications-resend — FastAPI async email channel via Resend.

Subclasses notifications.adapters.NotificationAdapter (channel="email")
and overrides the registered "email" adapter at app startup. The
notifications.dispatch() service stays unchanged — it just sees a
different adapter behind the same channel name.
"""
import os
from typing import Any
from uuid import uuid4

from app.notifications.adapters import NotificationAdapter, register_adapter


# Lazy import — module loads in test envs without resend installed.
_resend_module: Any | None = None


def _resend() -> Any:
    global _resend_module
    if _resend_module is None:
        import resend  # type: ignore

        resend.api_key = os.environ.get("RESEND_API_KEY", "")
        _resend_module = resend
    return _resend_module


def register_resend_for_tests(fake: Any) -> None:
    """Test hook — inject a fake module exposing Emails.send."""
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

    async def send(
        self, recipient: str, template: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        from_field = (
            f"{self.from_name} <{self.from_address}>"
            if self.from_name
            else self.from_address
        )
        # Phase 3 scope: pass through with template name in subject + data
        # rendered as a plaintext body. Real templating (HTML, MJML) lands
        # in Phase 4 once we ship a templates registry.
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
    """Register ResendEmailAdapter for the ``email`` channel.

    Loaded after notifications.adapters in the wirer's lifespan order,
    so this overrides the StubEmailAdapter that ships with notifications.
    """
    register_adapter(ResendEmailAdapter())
