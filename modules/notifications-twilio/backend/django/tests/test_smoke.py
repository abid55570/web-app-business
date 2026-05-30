"""notifications-twilio Django smoke — sync SMS adapter + injected fake."""
from types import SimpleNamespace

import pytest

from notifications.adapters import NotificationAdapter
from notifications_twilio.adapters import (
    TwilioSmsAdapter,
    register_twilio_for_tests,
)


@pytest.fixture(autouse=True)
def _swap_twilio():
    sent: list[dict] = []

    class _FakeMessages:
        @staticmethod
        def create(**kwargs):
            sent.append(kwargs)
            return SimpleNamespace(sid="SM_fake_1", status="delivered")

    register_twilio_for_tests(SimpleNamespace(messages=_FakeMessages))
    yield sent
    register_twilio_for_tests(None)  # type: ignore[arg-type]


def test_implements_notification_adapter_abc():
    assert isinstance(TwilioSmsAdapter(), NotificationAdapter)


def test_channel_is_sms():
    assert TwilioSmsAdapter().channel == "sms"


def test_send_returns_sent_with_provider_id(_swap_twilio):
    res = TwilioSmsAdapter(from_number="+14155551234").send(
        "+15551234567", "order.placed", {"orderId": "abc"}
    )
    assert res["id"] == "SM_fake_1"
    assert res["status"] == "sent"
    assert _swap_twilio[0]["from_"] == "+14155551234"


def test_messaging_service_sid_overrides_from(_swap_twilio):
    TwilioSmsAdapter(
        from_number="+14155551234", messaging_service_sid="MG_a"
    ).send("+15551234567", "t", {})
    assert _swap_twilio[0]["messaging_service_sid"] == "MG_a"
    assert "from_" not in _swap_twilio[0]


def test_failed_status_normalisation():
    class _Failing:
        @staticmethod
        def create(**_):
            return SimpleNamespace(sid="SM_x", status="failed")

    register_twilio_for_tests(SimpleNamespace(messages=_Failing))
    res = TwilioSmsAdapter(from_number="+1").send("+2", "t", {})
    assert res["status"] == "failed"


def test_install_default_registers_for_sms():
    from notifications.adapters import get_adapter
    from notifications_twilio.adapters import install_default

    install_default()
    adapter = get_adapter("sms")
    assert isinstance(adapter, TwilioSmsAdapter)
