"""payment-core — async PaymentAdapter ABC + global registry.

Concrete gateway modules (payment-fake, payment-stripe, payment-razorpay,
...) implement PaymentAdapter and register their instance via
``set_payment_adapter()`` at startup. Service code (e.g. ``orders``) calls
``get_payment_adapter()`` and never sees which gateway is live —
strategy-agnostic just like auth-core's session token primitives.
"""
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Any


class PaymentAdapter(ABC):
    name: str

    @abstractmethod
    async def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Returns ``{ intentId, clientSecret?, status }``."""

    @abstractmethod
    async def capture(self, intent_id: str) -> bool:
        """Capture/confirm. True on success."""

    @abstractmethod
    async def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        """Refund (full when amount=None). True on success."""


_default_adapter: PaymentAdapter | None = None


def get_payment_adapter() -> PaymentAdapter:
    """Return the registered adapter. Raises if no module installed one."""
    if _default_adapter is None:
        raise RuntimeError(
            "No payment adapter registered. Include a payment-* module "
            "(e.g. payment-fake or payment-stripe) and ensure its "
            "install_default() ran at startup.",
        )
    return _default_adapter


def set_payment_adapter(adapter: PaymentAdapter) -> None:
    """Install ``adapter`` as the global. Last installer wins; payment
    gateway modules call this from their startup hook."""
    global _default_adapter
    _default_adapter = adapter


def clear_payment_adapter() -> None:
    """Reset the registry. Test hook."""
    global _default_adapter
    _default_adapter = None
