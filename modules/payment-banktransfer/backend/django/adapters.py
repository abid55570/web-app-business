"""payment-banktransfer — Django sync adapter."""
import secrets
from decimal import Decimal
from typing import Any

from payment_core.adapters import PaymentAdapter, set_payment_adapter


_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def _short_ref(prefix: str) -> str:
    suffix = "".join(secrets.choice(_ALPHABET) for _ in range(6))
    return f"{prefix}-{suffix}"


class BankTransferPaymentAdapter(PaymentAdapter):
    name = "banktransfer"

    def __init__(
        self,
        account_name: str = "",
        account_number: str = "",
        bank_name: str = "",
        ifsc_or_swift: str = "",
        reference_prefix: str = "ORD",
    ) -> None:
        self.account_name = account_name
        self.account_number = account_number
        self.bank_name = bank_name
        self.ifsc_or_swift = ifsc_or_swift
        self.reference_prefix = reference_prefix

    def create_intent(self, amount, currency, metadata=None):
        ref = _short_ref(self.reference_prefix)
        return {
            "intentId": f"bt_{ref}",
            "clientSecret": None,
            "status": "awaiting_payment",
            "reference": ref,
            "instructions": {
                "accountName": self.account_name,
                "accountNumber": self.account_number,
                "bankName": self.bank_name,
                "ifscOrSwift": self.ifsc_or_swift,
                "amount": str(amount),
                "currency": currency,
                "reference": ref,
            },
        }

    def capture(self, intent_id: str) -> bool:
        return True

    def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        return True


def install_default() -> None:
    set_payment_adapter(BankTransferPaymentAdapter())
