"""notifications-whatsapp — FastAPI async WhatsApp Cloud adapter.

Posts to ``https://graph.facebook.com/<v>/<phone_number_id>/messages``
with the standard WhatsApp Business Cloud envelope. Plain `text` body
works for any conversation in the 24h support window; templates are
required outside that window — `default_template` config covers the
common case (one-off transactional notifications).
"""
import os
from typing import Any
from uuid import uuid4

import httpx

from app.notifications.adapters import NotificationAdapter, register_adapter


# Test hook — swap the httpx.AsyncClient factory.
_client_factory: Any | None = None


def register_client_for_tests(factory: Any) -> None:
    """Inject a callable returning a context-manager-compatible fake client.
    The fake's .post(...) MUST return an object with .status_code, .json()."""
    global _client_factory
    _client_factory = factory


def _make_client():
    if _client_factory is not None:
        return _client_factory()
    return httpx.AsyncClient(timeout=10.0)


class WhatsappCloudAdapter(NotificationAdapter):
    name = "whatsapp-cloud"
    channel = "whatsapp"

    def __init__(
        self,
        graph_api_version: str = "v22.0",
        default_template: str = "",
    ) -> None:
        self.graph_api_version = graph_api_version
        self.default_template = default_template
        self.phone_number_id = os.environ.get("WHATSAPP_PHONE_NUMBER_ID", "")
        self.access_token = os.environ.get("WHATSAPP_ACCESS_TOKEN", "")

    def _url(self) -> str:
        return (
            f"https://graph.facebook.com/{self.graph_api_version}"
            f"/{self.phone_number_id}/messages"
        )

    def _envelope(
        self, recipient: str, template: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        # If the caller passed a free-text body, send a `text` message.
        # Otherwise treat ``template`` as an approved template name and
        # pass ``data`` through as the template's parameter dict.
        if "body" in data:
            return {
                "messaging_product": "whatsapp",
                "to": recipient,
                "type": "text",
                "text": {"body": data["body"]},
            }
        template_name = (
            template if template and template != "text" else self.default_template
        )
        return {
            "messaging_product": "whatsapp",
            "to": recipient,
            "type": "template",
            "template": {
                "name": template_name,
                "language": {"code": data.get("language", "en_US")},
                "components": data.get("components", []),
            },
        }

    async def send(
        self, recipient: str, template: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        envelope = self._envelope(recipient, template, data)
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        try:
            async with _make_client() as client:
                res = await client.post(self._url(), json=envelope, headers=headers)
        except Exception as exc:  # noqa: BLE001
            return {"id": uuid4().hex, "status": "failed", "error": str(exc)}

        if res.status_code >= 400:
            try:
                err = res.json()
            except Exception:  # noqa: BLE001
                err = {"raw": "<non-json>"}
            return {
                "id": uuid4().hex,
                "status": "failed",
                "error": str(err),
            }
        body = res.json()
        msg_id = (
            (body.get("messages") or [{}])[0].get("id")
            or body.get("id")
            or uuid4().hex
        )
        return {"id": msg_id, "status": "sent"}


def install_default() -> None:
    """Register WhatsappCloudAdapter for the ``whatsapp`` channel."""
    register_adapter(WhatsappCloudAdapter())
