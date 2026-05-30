"""notifications-twilio smoke (FastAPI) — sends via injected fake Twilio."""
from types import SimpleNamespace

import pytest

from app.notifications.adapters import NotificationAdapter
from app.notifications_twilio.adapters import (
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
            return SimpleNamespace(sid="SM_fake_1", status="queued")

    register_twilio_for_tests(SimpleNamespace(messages=_FakeMessages))
    yield sent
    register_twilio_for_tests(None)  # type: ignore[arg-type]


def test_implements_notification_adapter_abc():
    assert isinstance(TwilioSmsAdapter(), NotificationAdapter)


def test_channel_is_sms():
    """``sms`` channel name MUST match dispatch's lookup."""
    assert TwilioSmsAdapter().channel == "sms"


@pytest.mark.asyncio
async def test_send_with_from_number_uses_from_kwarg(_swap_twilio):
    adapter = TwilioSmsAdapter(from_number="+14155551234")
    res = await adapter.send(
        "+15551234567",
        "order.placed",
        {"orderId": "abc", "total": 12.5},
    )
    assert res["id"] == "SM_fake_1"
    assert res["status"] == "sent"  # 'queued' normalised to 'sent'
    sent = _swap_twilio
    assert sent[0]["to"] == "+15551234567"
    assert sent[0]["from_"] == "+14155551234"
    assert "order.placed" in sent[0]["body"]


@pytest.mark.asyncio
async def test_messaging_service_sid_overrides_from_number(_swap_twilio):
    adapter = TwilioSmsAdapter(
        from_number="+14155551234",
        messaging_service_sid="MG_test_1",
    )
    await adapter.send("+15551234567", "tmpl", {})
    sent = _swap_twilio
    assert sent[0]["messaging_service_sid"] == "MG_test_1"
    assert "from_" not in sent[0]


@pytest.mark.asyncio
async def test_explicit_body_in_data_overrides_template_format(_swap_twilio):
    adapter = TwilioSmsAdapter(from_number="+14155551234")
    await adapter.send(
        "+15551234567",
        "ignored.template",
        {"body": "Custom payload."},
    )
    assert _swap_twilio[0]["body"] == "Custom payload."


@pytest.mark.asyncio
async def test_failed_twilio_status_normalises_to_failed():
    class _Failing:
        @staticmethod
        def create(**kwargs):
            return SimpleNamespace(sid="SM_x", status="undelivered")

    register_twilio_for_tests(SimpleNamespace(messages=_Failing))
    res = await TwilioSmsAdapter(from_number="+1").send("+2", "t", {})
    assert res["status"] == "failed"


@pytest.mark.asyncio
async def test_send_failed_status_when_upstream_raises():
    class _Boom:
        @staticmethod
        def create(**_):
            raise RuntimeError("invalid To")

    register_twilio_for_tests(SimpleNamespace(messages=_Boom))
    res = await TwilioSmsAdapter(from_number="+1").send("+2", "t", {})
    assert res["status"] == "failed"
    assert "invalid To" in res["error"]


def test_install_default_registers_for_sms_channel():
    from app.notifications.adapters import get_adapter
    from app.notifications_twilio.adapters import install_default

    install_default()
    adapter = get_adapter("sms")
    assert isinstance(adapter, TwilioSmsAdapter)
