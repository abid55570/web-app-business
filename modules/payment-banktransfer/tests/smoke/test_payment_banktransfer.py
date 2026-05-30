"""payment-banktransfer smoke (FastAPI)."""
from decimal import Decimal

import pytest

from app.payment_core.adapters import PaymentAdapter, get_payment_adapter
from app.payment_banktransfer.adapters import BankTransferPaymentAdapter


def test_implements_payment_adapter_abc():
    assert isinstance(BankTransferPaymentAdapter(), PaymentAdapter)


def test_install_default_registers_as_active_gateway():
    assert isinstance(get_payment_adapter(), BankTransferPaymentAdapter)


@pytest.mark.asyncio
async def test_create_intent_returns_awaiting_payment_with_reference():
    adapter = BankTransferPaymentAdapter(
        account_name="Acme Pvt Ltd",
        account_number="00123456789",
        bank_name="Example Bank",
        ifsc_or_swift="EXMP0000123",
        reference_prefix="ORD",
    )
    res = await adapter.create_intent(Decimal("250.00"), "INR")
    assert res["status"] == "awaiting_payment"
    assert res["intentId"].startswith("bt_ORD-")
    assert res["reference"].startswith("ORD-")
    assert len(res["reference"]) == 10  # ORD- + 6 chars
    assert res["clientSecret"] is None


@pytest.mark.asyncio
async def test_create_intent_surfaces_bank_details_for_checkout_ui():
    adapter = BankTransferPaymentAdapter(
        account_name="Acme",
        account_number="111",
        bank_name="Test Bank",
        ifsc_or_swift="TEST0001",
    )
    res = await adapter.create_intent(Decimal("99.99"), "USD")
    inst = res["instructions"]
    assert inst["accountName"] == "Acme"
    assert inst["accountNumber"] == "111"
    assert inst["bankName"] == "Test Bank"
    assert inst["ifscOrSwift"] == "TEST0001"
    assert inst["amount"] == "99.99"
    assert inst["currency"] == "USD"
    assert inst["reference"] == res["reference"]


@pytest.mark.asyncio
async def test_each_intent_gets_a_unique_reference():
    adapter = BankTransferPaymentAdapter()
    refs = set()
    for _ in range(20):
        res = await adapter.create_intent(Decimal("1"), "USD")
        refs.add(res["reference"])
    assert len(refs) == 20  # collisions vanishingly improbable for 6 chars


@pytest.mark.asyncio
async def test_capture_is_manual_noop_success():
    """Capture is intentionally a no-op success — operator confirms receipt
    via the admin /confirm-banktransfer endpoint (Phase 4)."""
    assert await BankTransferPaymentAdapter().capture("bt_ORD-ABCDEF") is True


@pytest.mark.asyncio
async def test_refund_records_intent_returns_true():
    """We can't reverse the wire automatically, but record-keeping says yes."""
    assert await BankTransferPaymentAdapter().refund("bt_x") is True
    assert (
        await BankTransferPaymentAdapter().refund("bt_x", Decimal("50"))
        is True
    )


def test_reference_alphabet_excludes_ambiguous_chars():
    """Reference characters MUST avoid 0/O/1/I to prevent customer errors
    when typing the reference into their banking portal."""
    adapter = BankTransferPaymentAdapter(reference_prefix="X")
    forbidden = {"0", "O", "1", "I"}
    # Generate a few hundred references; none of the SUFFIX chars should
    # land in the forbidden set.
    import asyncio

    async def gen():
        for _ in range(100):
            res = await adapter.create_intent(Decimal("1"), "USD")
            suffix = res["reference"].split("-", 1)[1]
            assert not (set(suffix) & forbidden), (
                f"suffix {suffix} contains ambiguous char"
            )

    asyncio.run(gen())
