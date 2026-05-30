"""payment@v1 smoke — fake adapter always succeeds, swap hook works."""
from decimal import Decimal

import pytest

from app.payment_fake.adapters import (
    FakePaymentAdapter,
    PaymentAdapter,
    get_payment_adapter,
    set_payment_adapter,
)


@pytest.mark.asyncio
async def test_create_intent_returns_intent_id_and_pending_status():
    adapter = FakePaymentAdapter()
    intent = await adapter.create_intent(Decimal("10.00"), "USD")

    assert intent["intentId"].startswith("fake_")
    assert intent["status"] == "requires_capture"
    assert intent["clientSecret"] is None


@pytest.mark.asyncio
async def test_create_intent_accepts_optional_metadata():
    adapter = FakePaymentAdapter()
    intent = await adapter.create_intent(
        Decimal("99.99"), "EUR", metadata={"customerId": "abc"}
    )
    assert intent["intentId"].startswith("fake_")


@pytest.mark.asyncio
async def test_capture_succeeds_unconditionally():
    adapter = FakePaymentAdapter()
    assert await adapter.capture("any_intent_id") is True


@pytest.mark.asyncio
async def test_refund_full_and_partial_both_succeed():
    adapter = FakePaymentAdapter()
    assert await adapter.refund("txn_x") is True
    assert await adapter.refund("txn_x", Decimal("5.00")) is True


def test_default_adapter_is_fake_and_implements_abc():
    adapter = get_payment_adapter()
    assert adapter.name == "fake"
    assert isinstance(adapter, PaymentAdapter)


def test_set_payment_adapter_swaps_global_singleton():
    class CustomAdapter(PaymentAdapter):
        name = "custom"

        async def create_intent(self, amount, currency, metadata=None):
            return {"intentId": "custom_x", "status": "ok"}

        async def capture(self, intent_id):
            return False

        async def refund(self, transaction_id, amount=None):
            return False

    original = get_payment_adapter()
    try:
        set_payment_adapter(CustomAdapter())
        assert get_payment_adapter().name == "custom"
    finally:
        set_payment_adapter(original)
        assert get_payment_adapter().name == "fake"
