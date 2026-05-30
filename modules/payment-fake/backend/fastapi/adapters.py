"""payment-fake — always-succeeds adapter implementing payment@v1.

Phase 2+ refactor: ABC + registry now live in ``payment-core``. This module
just provides ``FakePaymentAdapter`` and an ``install_default()`` startup
hook to register itself.
"""
from typing import Any
from uuid import uuid4

from app.payment_core.adapters import PaymentAdapter, set_payment_adapter


class FakePaymentAdapter(PaymentAdapter):
    name = "fake"

    async def create_intent(self, amount, currency, metadata=None):
        return {
            "intentId": f"fake_{uuid4().hex}",
            "clientSecret": None,
            "status": "requires_capture",
        }

    async def capture(self, intent_id: str) -> bool:
        return True

    async def refund(self, transaction_id, amount=None):
        return True


def install_default() -> None:
    """Register FakePaymentAdapter as the global. Side-effect-installed at
    module import below; explicit re-call lets the wirer's lifespan hook
    re-assert the gateway after tests muck with the registry."""
    set_payment_adapter(FakePaymentAdapter())


# Backwards-compat re-exports — pre-refactor modules importing from this
# module's old surface keep working.
from app.payment_core.adapters import (  # noqa: E402, F401
    get_payment_adapter,
    set_payment_adapter,
)


# Side-effect: register on import. Real gateway modules (payment-stripe)
# may override later in app boot if also in the recipe.
install_default()
