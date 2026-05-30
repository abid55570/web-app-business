"""notifications-resend Django smoke — sync adapter + injected fake."""
from types import SimpleNamespace

import pytest

from notifications.adapters import NotificationAdapter
from notifications_resend.adapters import (
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
    assert ResendEmailAdapter().channel == "email"


def test_send_returns_sent_with_provider_id(_swap_resend):
    res = ResendEmailAdapter(from_address="hi@example.com").send(
        "user@example.com",
        "order.placed",
        {"orderId": "abc"},
    )
    assert res["id"] == "re_resend_1"
    assert res["status"] == "sent"
    assert _swap_resend[0]["subject"] == "order.placed"


def test_send_failed_status_when_upstream_raises():
    class _Boom:
        @staticmethod
        def send(_payload):
            raise RuntimeError("rate limited")

    register_resend_for_tests(SimpleNamespace(Emails=_Boom))
    res = ResendEmailAdapter().send("u@example.com", "order.placed", {})
    assert res["status"] == "failed"


def test_install_default_overrides_stub_email():
    from notifications.adapters import get_adapter
    from notifications_resend.adapters import install_default

    install_default()
    adapter = get_adapter("email")
    assert isinstance(adapter, ResendEmailAdapter)
