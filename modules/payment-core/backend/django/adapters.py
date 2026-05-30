"""payment-core — sync PaymentAdapter ABC + global registry (Django).

Sync mirror of the FastAPI version. Concrete gateways (payment-fake,
payment-stripe, ...) inherit and register via ``set_payment_adapter()``
at app startup (typically in their ``AppConfig.ready()``).
"""
from abc import ABC, abstractmethod
from decimal import Decimal
from typing import Any


class PaymentAdapter(ABC):
    name: str

    @abstractmethod
    def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        """Returns ``{ intentId, clientSecret?, status }``."""

    @abstractmethod
    def capture(self, intent_id: str) -> bool:
        """Capture/confirm. True on success."""

    @abstractmethod
    def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        """Refund (full when amount=None). True on success."""


_default_adapter: PaymentAdapter | None = None


def get_payment_adapter() -> PaymentAdapter:
    if _default_adapter is None:
        raise RuntimeError(
            "No payment adapter registered. Include a payment-* module "
            "(e.g. payment-fake or payment-stripe) and ensure its "
            "AppConfig.ready() registered an adapter.",
        )
    return _default_adapter


def set_payment_adapter(adapter: PaymentAdapter) -> None:
    global _default_adapter
    _default_adapter = adapter


def clear_payment_adapter() -> None:
    global _default_adapter
    _default_adapter = None
