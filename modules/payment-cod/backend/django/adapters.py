"""payment-cod — cash-on-delivery adapter (Django sync)."""
from decimal import Decimal
from typing import Any
from uuid import uuid4

from payment_core.adapters import PaymentAdapter, set_payment_adapter


class CodPaymentAdapter(PaymentAdapter):
    name = "cod"

    def __init__(self, max_order_amount: Decimal = Decimal("0")) -> None:
        self.max_order_amount = max_order_amount

    def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        if self.max_order_amount > 0 and amount > self.max_order_amount:
            return {
                "intentId": f"cod_rejected_{uuid4().hex}",
                "status": "rejected",
                "reason": f"Above COD cap of {self.max_order_amount}",
            }
        return {
            "intentId": f"cod_{uuid4().hex}",
            "clientSecret": None,
            "status": "awaiting_payment",
        }

    def capture(self, intent_id: str) -> bool:
        return not intent_id.startswith("cod_rejected_")

    def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        return True


def install_default() -> None:
    set_payment_adapter(CodPaymentAdapter())
