"""notifications-whatsapp Django smoke."""
import os

import pytest

from notifications.adapters import NotificationAdapter
from notifications_whatsapp.adapters import (
    WhatsappCloudAdapter,
    register_client_for_tests,
)


class _FakeResponse:
    def __init__(self, status_code: int, payload) -> None:
        self.status_code = status_code
        self._payload = payload

    def json(self):
        return self._payload


class _FakeClient:
    def __init__(self, response=None, raise_on_post=None):
        self.response = response or _FakeResponse(
            200, {"messages": [{"id": "wamid.dj_1"}]}
        )
        self.raise_on_post = raise_on_post
        self.calls: list[dict] = []

    def __enter__(self):
        return self

    def __exit__(self, *_):
        return False

    def post(self, url, *, json, headers):
        self.calls.append({"url": url, "json": json, "headers": headers})
        if self.raise_on_post is not None:
            raise self.raise_on_post
        return self.response


@pytest.fixture(autouse=True)
def _swap_httpx():
    os.environ["WHATSAPP_PHONE_NUMBER_ID"] = "999"
    os.environ["WHATSAPP_ACCESS_TOKEN"] = "EAA_dj"
    captured: dict[str, _FakeClient | None] = {"client": None}

    def factory(response=None, raise_on_post=None):
        c = _FakeClient(response=response, raise_on_post=raise_on_post)
        captured["client"] = c
        return c

    register_client_for_tests(factory)
    yield captured
    register_client_for_tests(None)


def test_channel_is_whatsapp():
    assert WhatsappCloudAdapter().channel == "whatsapp"


def test_implements_notification_adapter_abc():
    assert isinstance(WhatsappCloudAdapter(), NotificationAdapter)


def test_text_envelope_round_trip(_swap_httpx):
    res = WhatsappCloudAdapter().send("+1", "ignored", {"body": "Hello"})
    assert res["status"] == "sent"
    assert res["id"] == "wamid.dj_1"
    assert _swap_httpx["client"].calls[0]["json"]["type"] == "text"


def test_4xx_returns_failed():
    bad = _FakeResponse(401, {"error": {"message": "Invalid OAuth token"}})
    register_client_for_tests(lambda: _FakeClient(response=bad))
    res = WhatsappCloudAdapter().send("+1", "tmpl", {})
    assert res["status"] == "failed"
    assert "Invalid OAuth token" in res["error"]


def test_install_default_registers_for_whatsapp():
    from notifications.adapters import get_adapter
    from notifications_whatsapp.adapters import install_default

    install_default()
    assert isinstance(get_adapter("whatsapp"), WhatsappCloudAdapter)
