"""payment-cod Django smoke."""
from decimal import Decimal

from payment_core.adapters import PaymentAdapter, get_payment_adapter
from payment_cod.adapters import CodPaymentAdapter


def test_implements_payment_adapter_abc():
    assert isinstance(CodPaymentAdapter(), PaymentAdapter)


def test_install_default_registers_as_active_gateway():
    assert isinstance(get_payment_adapter(), CodPaymentAdapter)


def test_create_intent_returns_awaiting_payment():
    res = CodPaymentAdapter().create_intent(Decimal("10.00"), "USD")
    assert res["intentId"].startswith("cod_")
    assert res["status"] == "awaiting_payment"


def test_create_intent_rejects_over_cap():
    res = CodPaymentAdapter(max_order_amount=Decimal("100")).create_intent(
        Decimal("250"), "USD"
    )
    assert res["status"] == "rejected"


def test_capture_returns_false_for_rejected_intent():
    assert CodPaymentAdapter().capture("cod_rejected_x") is False


def test_capture_returns_true_for_normal_intent():
    res = CodPaymentAdapter().create_intent(Decimal("1"), "USD")
    assert CodPaymentAdapter().capture(res["intentId"]) is True


def test_refund_no_op_succeeds():
    assert CodPaymentAdapter().refund("any") is True
