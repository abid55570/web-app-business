"""payment-banktransfer Django smoke."""
from decimal import Decimal

from payment_core.adapters import PaymentAdapter, get_payment_adapter
from payment_banktransfer.adapters import BankTransferPaymentAdapter


def test_implements_payment_adapter_abc():
    assert isinstance(BankTransferPaymentAdapter(), PaymentAdapter)


def test_install_default_registers_as_active_gateway():
    assert isinstance(get_payment_adapter(), BankTransferPaymentAdapter)


def test_create_intent_returns_reference_and_instructions():
    res = BankTransferPaymentAdapter(
        account_name="Acme",
        account_number="0011",
        bank_name="Demo Bank",
        ifsc_or_swift="DEMO0000",
    ).create_intent(Decimal("250.00"), "INR")
    assert res["status"] == "awaiting_payment"
    assert res["intentId"].startswith("bt_ORD-")
    assert res["instructions"]["accountName"] == "Acme"
    assert res["instructions"]["currency"] == "INR"


def test_each_intent_gets_unique_reference():
    adapter = BankTransferPaymentAdapter()
    refs = {
        adapter.create_intent(Decimal("1"), "USD")["reference"]
        for _ in range(20)
    }
    assert len(refs) == 20


def test_capture_is_manual_noop_success():
    assert BankTransferPaymentAdapter().capture("bt_anything") is True


def test_refund_records_intent_returns_true():
    assert BankTransferPaymentAdapter().refund("bt_x") is True


def test_reference_excludes_ambiguous_chars():
    forbidden = {"0", "O", "1", "I"}
    adapter = BankTransferPaymentAdapter()
    for _ in range(50):
        suffix = adapter.create_intent(Decimal("1"), "USD")["reference"].split(
            "-", 1
        )[1]
        assert not (set(suffix) & forbidden)
