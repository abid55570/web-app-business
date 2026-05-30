"""payment-stripe — FastAPI async adapter implementing payment@v1.

The official ``stripe`` python lib is sync. We wrap each call in
``asyncio.to_thread`` so the adapter satisfies the async ABC without
blocking the event loop.

Smoke tests substitute a fake ``stripe`` module via ``register_stripe_for_tests``
so the contract is exercised without a live key.
"""
import asyncio
from decimal import Decimal
from typing import Any

from app.config import settings
from app.payment_core.adapters import PaymentAdapter, set_payment_adapter


# Lazy import so the module loads even when stripe isn't installed (eg in
# unit tests that swap in a fake) — production must have it pinned via
# pyproject.toml's `stripe>=10.0.0` from the module's dependencies block.
_stripe_module: Any | None = None


def _stripe() -> Any:
    global _stripe_module
    if _stripe_module is None:
        import stripe  # type: ignore

        stripe.api_key = getattr(settings, "stripe_secret_key", None) or ""
        _stripe_module = stripe
    return _stripe_module


def register_stripe_for_tests(fake: Any) -> None:
    """Test hook — inject a fake module exposing PaymentIntent + Refund."""
    global _stripe_module
    _stripe_module = fake


class StripePaymentAdapter(PaymentAdapter):
    name = "stripe"

    def __init__(self, capture_method: str = "manual") -> None:
        self.capture_method = capture_method

    async def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        # Stripe wants integer minor units (cents).
        minor_units = int((amount * 100).to_integral_value())
        intent = await asyncio.to_thread(
            _stripe().PaymentIntent.create,
            amount=minor_units,
            currency=currency.lower(),
            capture_method=self.capture_method,
            metadata=metadata or {},
        )
        return {
            "intentId": intent["id"],
            "clientSecret": intent.get("client_secret"),
            "status": intent.get("status", "requires_capture"),
        }

    async def capture(self, intent_id: str) -> bool:
        try:
            res = await asyncio.to_thread(
                _stripe().PaymentIntent.capture, intent_id
            )
            return res.get("status") == "succeeded"
        except Exception:  # noqa: BLE001
            return False

    async def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        kwargs: dict[str, Any] = {"payment_intent": transaction_id}
        if amount is not None:
            kwargs["amount"] = int((amount * 100).to_integral_value())
        try:
            res = await asyncio.to_thread(_stripe().Refund.create, **kwargs)
            return res.get("status") in {"succeeded", "pending"}
        except Exception:  # noqa: BLE001
            return False


def install_default() -> None:
    """Wire StripePaymentAdapter as the global adapter (call from main.py
    when payment-stripe is in the recipe — wirer derives this in Phase 3)."""
    set_payment_adapter(StripePaymentAdapter())
