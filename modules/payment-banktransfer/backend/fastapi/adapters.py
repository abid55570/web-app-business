"""payment-banktransfer — FastAPI async adapter.

No external API. ``create_intent`` mints a short, human-friendly reference
the customer quotes on their wire transfer and returns the bank account
details so the checkout UI can surface them. Order sits in
``awaiting_payment`` until the operator confirms receipt manually.
"""
import secrets
from decimal import Decimal
from typing import Any

from app.payment_core.adapters import PaymentAdapter, set_payment_adapter


# 26-char alphabet — drops 0/O/1/I to avoid ambiguity in the reference.
_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"


def _short_ref(prefix: str) -> str:
    """Generate a six-char human-friendly reference suffix."""
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

    async def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
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

    async def capture(self, intent_id: str) -> bool:
        # Manual confirmation flow — capture() is a no-op success so the
        # order moves into the system. The admin marks paid via the
        # confirm-banktransfer endpoint (Phase 4).
        return True

    async def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        # We can't reverse the wire automatically. Operator initiates
        # a return transfer outside the system; this just records intent.
        return True


def install_default() -> None:
    set_payment_adapter(BankTransferPaymentAdapter())
