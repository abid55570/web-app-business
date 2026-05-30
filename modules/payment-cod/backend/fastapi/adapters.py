"""payment-cod — cash-on-delivery adapter (FastAPI async).

No external API. ``create_intent`` mints a local ``cod_<uuid>`` reference
and returns ``status: awaiting_payment`` so the orders module can store
the order while the customer pays in cash on delivery. ``capture()`` is
a no-op success — the order moves to confirmed regardless. ``refund()``
is also a no-op success since no electronic payment was ever taken.
"""
from decimal import Decimal
from typing import Any
from uuid import uuid4

from app.payment_core.adapters import PaymentAdapter, set_payment_adapter


class CodPaymentAdapter(PaymentAdapter):
    name = "cod"

    def __init__(self, max_order_amount: Decimal = Decimal("0")) -> None:
        self.max_order_amount = max_order_amount

    async def create_intent(
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

    async def capture(self, intent_id: str) -> bool:
        # No actual capture step — cash will be collected on delivery.
        # Returning True keeps the orders flow simple; the operator
        # toggles "paid" via /api/admin/orders/<id>/confirm-cod (Phase 4).
        return not intent_id.startswith("cod_rejected_")

    async def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        # No money to refund electronically; record-keeping only.
        return True


def install_default() -> None:
    set_payment_adapter(CodPaymentAdapter())
