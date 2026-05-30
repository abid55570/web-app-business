"""notifications-whatsapp smoke (FastAPI) — sends via injected fake httpx."""
import os
from typing import Any

import pytest

from app.notifications.adapters import NotificationAdapter
from app.notifications_whatsapp.adapters import (
    WhatsappCloudAdapter,
    register_client_for_tests,
)


class _FakeResponse:
    def __init__(self, status_code: int, payload: Any) -> None:
        self.status_code = status_code
        self._payload = payload

    def json(self) -> Any:
        return self._payload


class _FakeClient:
    def __init__(
        self, response: _FakeResponse | None = None, raise_on_post: Exception | None = None
    ) -> None:
        self.response = response or _FakeResponse(
            200, {"messages": [{"id": "wamid.HBg_test_1"}]}
        )
        self.raise_on_post = raise_on_post
        self.calls: list[dict] = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_):
        return False

    async def post(self, url: str, *, json, headers):
        self.calls.append({"url": url, "json": json, "headers": headers})
        if self.raise_on_post is not None:
            raise self.raise_on_post
        return self.response


@pytest.fixture(autouse=True)
def _swap_httpx():
    os.environ["WHATSAPP_PHONE_NUMBER_ID"] = "1234567890"
    os.environ["WHATSAPP_ACCESS_TOKEN"] = "EAA_test_token"
    captured: dict[str, _FakeClient | None] = {"client": None}

    def factory(response=None, raise_on_post=None):
        c = _FakeClient(response=response, raise_on_post=raise_on_post)
        captured["client"] = c
        return c

    register_client_for_tests(factory)
    yield captured
    register_client_for_tests(None)


def test_implements_notification_adapter_abc():
    assert isinstance(WhatsappCloudAdapter(), NotificationAdapter)


def test_channel_is_whatsapp():
    assert WhatsappCloudAdapter().channel == "whatsapp"


@pytest.mark.asyncio
async def test_text_envelope_when_body_in_data(_swap_httpx):
    res = await WhatsappCloudAdapter().send(
        "+15551234567", "anything", {"body": "Your order is ready."}
    )
    assert res["status"] == "sent"
    assert res["id"] == "wamid.HBg_test_1"
    sent = _swap_httpx["client"].calls[0]
    assert sent["url"].endswith("/1234567890/messages")
    assert sent["json"]["type"] == "text"
    assert sent["json"]["text"]["body"] == "Your order is ready."
    assert sent["headers"]["Authorization"] == "Bearer EAA_test_token"


@pytest.mark.asyncio
async def test_template_envelope_when_no_body(_swap_httpx):
    await WhatsappCloudAdapter(default_template="order_confirmation").send(
        "+15551234567",
        "ignored.template",
        {"language": "en_US", "components": [{"type": "body"}]},
    )
    sent = _swap_httpx["client"].calls[0]
    assert sent["json"]["type"] == "template"
    assert sent["json"]["template"]["name"] == "ignored.template"
    assert sent["json"]["template"]["language"]["code"] == "en_US"


@pytest.mark.asyncio
async def test_4xx_response_returns_failed_with_error_body():
    bad = _FakeResponse(
        400,
        {"error": {"message": "(#131008) Required parameter is missing"}},
    )
    register_client_for_tests(lambda: _FakeClient(response=bad))
    res = await WhatsappCloudAdapter().send("+1", "tmpl", {})
    assert res["status"] == "failed"
    assert "Required parameter is missing" in res["error"]


@pytest.mark.asyncio
async def test_network_exception_returns_failed():
    register_client_for_tests(
        lambda: _FakeClient(raise_on_post=RuntimeError("connection reset"))
    )
    res = await WhatsappCloudAdapter().send("+1", "tmpl", {})
    assert res["status"] == "failed"
    assert "connection reset" in res["error"]


def test_install_default_registers_for_whatsapp_channel():
    from app.notifications.adapters import get_adapter
    from app.notifications_whatsapp.adapters import install_default

    install_default()
    adapter = get_adapter("whatsapp")
    assert isinstance(adapter, WhatsappCloudAdapter)


def test_url_builds_with_graph_api_version():
    a = WhatsappCloudAdapter(graph_api_version="v23.0")
    a.phone_number_id = "999"
    assert a._url() == "https://graph.facebook.com/v23.0/999/messages"
