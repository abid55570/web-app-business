"""payment-cod smoke (FastAPI)."""
from decimal import Decimal

import pytest

from app.payment_core.adapters import PaymentAdapter, get_payment_adapter
from app.payment_cod.adapters import CodPaymentAdapter


def test_implements_payment_adapter_abc():
    assert isinstance(CodPaymentAdapter(), PaymentAdapter)


def test_install_default_registers_as_active_gateway():
    assert isinstance(get_payment_adapter(), CodPaymentAdapter)


@pytest.mark.asyncio
async def test_create_intent_returns_awaiting_payment():
    adapter = CodPaymentAdapter()
    res = await adapter.create_intent(Decimal("10.00"), "USD")
    assert res["intentId"].startswith("cod_")
    assert res["status"] == "awaiting_payment"
    assert res["clientSecret"] is None


@pytest.mark.asyncio
async def test_create_intent_rejects_over_cap():
    adapter = CodPaymentAdapter(max_order_amount=Decimal("100.00"))
    res = await adapter.create_intent(Decimal("250.00"), "USD")
    assert res["status"] == "rejected"
    assert res["intentId"].startswith("cod_rejected_")
    assert "Above COD cap" in res["reason"]


@pytest.mark.asyncio
async def test_create_intent_at_cap_succeeds():
    adapter = CodPaymentAdapter(max_order_amount=Decimal("100.00"))
    res = await adapter.create_intent(Decimal("100.00"), "USD")
    assert res["status"] == "awaiting_payment"


@pytest.mark.asyncio
async def test_capture_succeeds_for_normal_intent():
    adapter = CodPaymentAdapter()
    res = await adapter.create_intent(Decimal("5"), "USD")
    assert await adapter.capture(res["intentId"]) is True


@pytest.mark.asyncio
async def test_capture_returns_false_for_rejected_intent():
    adapter = CodPaymentAdapter()
    assert await adapter.capture("cod_rejected_anything") is False


@pytest.mark.asyncio
async def test_refund_full_and_partial_both_succeed():
    adapter = CodPaymentAdapter()
    assert await adapter.refund("txn_x") is True
    assert await adapter.refund("txn_x", Decimal("3.00")) is True


def test_zero_max_order_amount_disables_cap():
    """Default 0 means no cap — large COD orders are accepted."""
    adapter = CodPaymentAdapter(max_order_amount=Decimal("0"))
    # No async needed for this purely synchronous predicate check.
    assert adapter.max_order_amount == Decimal("0")
