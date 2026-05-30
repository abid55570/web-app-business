"""payment-fake — sync always-succeeds adapter (Django).

Phase 2+ refactor: ABC + registry live in ``payment-core``. This module
just provides ``FakePaymentAdapter`` + an ``install_default()`` hook.
"""
from uuid import uuid4

from payment_core.adapters import PaymentAdapter, set_payment_adapter


class FakePaymentAdapter(PaymentAdapter):
    name = "fake"

    def create_intent(self, amount, currency, metadata=None):
        return {
            "intentId": f"fake_{uuid4().hex}",
            "clientSecret": None,
            "status": "requires_capture",
        }

    def capture(self, intent_id: str) -> bool:
        return True

    def refund(self, transaction_id, amount=None):
        return True


def install_default() -> None:
    set_payment_adapter(FakePaymentAdapter())


# Backwards-compat re-exports.
from payment_core.adapters import (  # noqa: E402, F401
    get_payment_adapter,
    set_payment_adapter,
)
