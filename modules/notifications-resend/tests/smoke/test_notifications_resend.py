"""notifications-resend smoke (FastAPI) — sends via injected fake Resend.

The contract: send() returns {id, status} with status=sent on the happy
path and status=failed (with error) when the upstream raises.
"""
from types import SimpleNamespace

import pytest

from app.notifications.adapters import NotificationAdapter
from app.notifications_resend.adapters import (
    ResendEmailAdapter,
    register_resend_for_tests,
)


@pytest.fixture(autouse=True)
def _swap_resend():
    sent: list[dict] = []

    class _FakeEmails:
        @staticmethod
        def send(payload):
            sent.append(payload)
            return {"id": "re_resend_1"}

    register_resend_for_tests(SimpleNamespace(Emails=_FakeEmails))
    yield sent
    register_resend_for_tests(None)  # type: ignore[arg-type]


def test_implements_notification_adapter_abc():
    assert isinstance(ResendEmailAdapter(), NotificationAdapter)


def test_channel_is_email():
    """``email`` channel name MUST match the dispatch service's lookup
    so this adapter slots in for the stub."""
    assert ResendEmailAdapter().channel == "email"


@pytest.mark.asyncio
async def test_send_returns_sent_with_provider_id(_swap_resend):
    adapter = ResendEmailAdapter(from_address="hi@example.com")
    res = await adapter.send(
        "user@example.com",
        "order.placed",
        {"orderId": "abc", "total": 12.5},
    )

    assert res["id"] == "re_resend_1"
    assert res["status"] == "sent"
    sent = _swap_resend
    assert sent[0]["from"] == "hi@example.com"
    assert sent[0]["to"] == ["user@example.com"]
    assert sent[0]["subject"] == "order.placed"
    assert "orderId: abc" in sent[0]["text"]


@pytest.mark.asyncio
async def test_send_with_friendly_from_name():
    adapter = ResendEmailAdapter(
        from_address="hi@example.com", from_name="Demo Restaurant"
    )
    await adapter.send("u@example.com", "order.placed", {})


@pytest.mark.asyncio
async def test_send_failed_status_when_upstream_raises():
    class _Boom:
        @staticmethod
        def send(_payload):
            raise RuntimeError("rate limited")

    register_resend_for_tests(SimpleNamespace(Emails=_Boom))
    res = await ResendEmailAdapter().send(
        "u@example.com", "order.placed", {}
    )
    assert res["status"] == "failed"
    assert "rate limited" in res["error"]


def test_install_default_registers_for_email_channel():
    from app.notifications.adapters import get_adapter
    from app.notifications_resend.adapters import install_default

    install_default()
    adapter = get_adapter("email")
    assert isinstance(adapter, ResendEmailAdapter)
