"""payment-razorpay Django smoke."""
from decimal import Decimal
from types import SimpleNamespace
from typing import Any

import pytest

from payment_core.adapters import PaymentAdapter, get_payment_adapter
from payment_razorpay.adapters import (
    RazorpayPaymentAdapter,
    register_razorpay_for_tests,
)


def _fake_client(raise_on=None):
    captured: dict[str, Any] = {}

    class _Order:
        @staticmethod
        def create(data):
            captured["order_create"] = data
            if raise_on == "order.create":
                raise RuntimeError("razorpay err")
            return {"id": f"order_dj_{data['amount']}", "status": "created"}

    class _Payment:
        @staticmethod
        def capture(payment_id, amount):
            captured["capture"] = (payment_id, amount)
            if raise_on == "payment.capture":
                raise RuntimeError("cap err")
            return {"status": "captured"}

        @staticmethod
        def refund(payment_id, amount=None):
            captured["refund"] = (payment_id, amount)
            if raise_on == "payment.refund":
                raise RuntimeError("rfnd err")
            return {"id": "rfnd_dj"}

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


def test_create_intent_paise_conversion(fake):
    res = RazorpayPaymentAdapter().create_intent(Decimal("12.50"), "INR")
    assert res["intentId"] == "order_dj_1250"
    assert fake._captured["order_create"]["amount"] == 1250


def test_create_intent_failure_returns_failed_envelope():
    register_razorpay_for_tests(_fake_client(raise_on="order.create"))
    res = RazorpayPaymentAdapter().create_intent(Decimal("5"), "INR")
    assert res["status"] == "failed"


def test_capture_returns_true(fake):
    assert RazorpayPaymentAdapter().capture("pay_x") is True


def test_capture_returns_false_on_error():
    register_razorpay_for_tests(_fake_client(raise_on="payment.capture"))
    assert RazorpayPaymentAdapter().capture("pay_x") is False


def test_refund_amount_in_paise(fake):
    assert (
        RazorpayPaymentAdapter().refund("pay_x", Decimal("4.20")) is True
    )
    assert fake._captured["refund"] == ("pay_x", 420)
