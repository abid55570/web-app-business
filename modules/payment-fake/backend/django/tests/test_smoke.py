"""payment-fake Django smoke — sync adapter + swap hook."""
from decimal import Decimal

from payment_fake.adapters import (
    FakePaymentAdapter,
    PaymentAdapter,
    get_payment_adapter,
    set_payment_adapter,
)


def test_create_intent_returns_intent_id_and_pending_status():
    adapter = FakePaymentAdapter()
    intent = adapter.create_intent(Decimal("10.00"), "USD")
    assert intent["intentId"].startswith("fake_")
    assert intent["status"] == "requires_capture"
    assert intent["clientSecret"] is None


def test_create_intent_accepts_optional_metadata():
    adapter = FakePaymentAdapter()
    intent = adapter.create_intent(
        Decimal("99.99"), "EUR", metadata={"customerId": "abc"}
    )
    assert intent["intentId"].startswith("fake_")


def test_capture_succeeds_unconditionally():
    adapter = FakePaymentAdapter()
    assert adapter.capture("any_intent_id") is True


def test_refund_full_and_partial_both_succeed():
    adapter = FakePaymentAdapter()
    assert adapter.refund("txn_x") is True
    assert adapter.refund("txn_x", Decimal("5.00")) is True


def test_default_adapter_is_fake_and_implements_abc():
    adapter = get_payment_adapter()
    assert adapter.name == "fake"
    assert isinstance(adapter, PaymentAdapter)


def test_set_payment_adapter_swaps_global_singleton():
    class CustomAdapter(PaymentAdapter):
        name = "custom"

        def create_intent(self, amount, currency, metadata=None):
            return {"intentId": "custom_x", "status": "ok"}

        def capture(self, intent_id):
            return False

        def refund(self, transaction_id, amount=None):
            return False

    original = get_payment_adapter()
    try:
        set_payment_adapter(CustomAdapter())
        assert get_payment_adapter().name == "custom"
    finally:
        set_payment_adapter(original)
        assert get_payment_adapter().name == "fake"
