"""payment-razorpay smoke (FastAPI) — fake-client-injected."""
from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.payment_core.adapters import PaymentAdapter, get_payment_adapter
from app.payment_razorpay.adapters import (
    RazorpayPaymentAdapter,
    register_razorpay_for_tests,
)


def _fake_client(order_response=None, raise_on=None):
    captured: dict[str, Any] = {}

    class _Order:
        @staticmethod
        def create(data):
            captured["order_create"] = data
            if raise_on == "order.create":
                raise RuntimeError("razorpay api err")
            return order_response or {
                "id": f"order_test_{data['amount']}",
                "status": "created",
            }

    class _Payment:
        @staticmethod
        def capture(payment_id, amount):
            captured["capture"] = (payment_id, amount)
            if raise_on == "payment.capture":
                raise RuntimeError("capture failed")
            return {"id": payment_id, "status": "captured"}

        @staticmethod
        def refund(payment_id, amount=None):
            captured["refund"] = (payment_id, amount)
            if raise_on == "payment.refund":
                raise RuntimeError("refund failed")
            return {"id": "rfnd_1"}

    return SimpleNamespace(order=_Order, payment=_Payment, _captured=captured)


@pytest.fixture
def fake():
    f = _fake_client()
    register_razorpay_for_tests(f)
    yield f
    register_razorpay_for_tests(None)  # type: ignore[arg-type]


def test_implements_payment_adapter_abc():
    assert isinstance(RazorpayPaymentAdapter(), PaymentAdapter)


def test_install_default_registers_as_active_gateway():
    assert isinstance(get_payment_adapter(), RazorpayPaymentAdapter)


@pytest.mark.asyncio
async def test_create_intent_converts_to_paise(fake):
    adapter = RazorpayPaymentAdapter(account_currency="INR")
    res = await adapter.create_intent(Decimal("12.50"), "INR")
    assert res["intentId"] == "order_test_1250"
    assert res["status"] == "created"
    assert res["clientSecret"] is None
    sent = fake._captured["order_create"]
    assert sent["amount"] == 1250
    assert sent["currency"] == "INR"
    assert sent["payment_capture"] == 0  # manual mode by default


@pytest.mark.asyncio
async def test_create_intent_automatic_mode_flag(fake):
    adapter = RazorpayPaymentAdapter(capture_method="automatic")
    await adapter.create_intent(Decimal("10"), "INR")
    assert fake._captured["order_create"]["payment_capture"] == 1


@pytest.mark.asyncio
async def test_create_intent_failure_returns_failed_envelope():
    register_razorpay_for_tests(_fake_client(raise_on="order.create"))
    res = await RazorpayPaymentAdapter().create_intent(Decimal("5"), "INR")
    assert res["status"] == "failed"
    assert res["intentId"].startswith("rzp_failed_")
    assert "razorpay api err" in res["error"]


@pytest.mark.asyncio
async def test_capture_calls_payment_capture(fake):
    assert await RazorpayPaymentAdapter().capture("pay_test_1") is True
    assert fake._captured["capture"] == ("pay_test_1", None)


@pytest.mark.asyncio
async def test_capture_returns_false_on_error():
    register_razorpay_for_tests(_fake_client(raise_on="payment.capture"))
    assert await RazorpayPaymentAdapter().capture("pay_test_1") is False


@pytest.mark.asyncio
async def test_refund_partial_passes_amount_in_paise(fake):
    assert (
        await RazorpayPaymentAdapter().refund("pay_x", Decimal("4.20"))
        is True
    )
    assert fake._captured["refund"] == ("pay_x", 420)


@pytest.mark.asyncio
async def test_refund_returns_false_on_error():
    register_razorpay_for_tests(_fake_client(raise_on="payment.refund"))
    assert await RazorpayPaymentAdapter().refund("pay_x") is False


# Type stub for the Any imports above; pytest collects these as helpers.
from typing import Any  # noqa: E402
