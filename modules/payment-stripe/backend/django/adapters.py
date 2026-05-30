"""payment-stripe — Django sync adapter implementing payment@v1.

The official ``stripe`` python lib is sync; Django views are sync; no
wrapping needed. Same contract as payment-fake's FakePaymentAdapter so
``orders`` callers can stay strategy-agnostic.
"""
import os
from decimal import Decimal
from typing import Any

from payment_core.adapters import PaymentAdapter, set_payment_adapter


_stripe_module: Any | None = None


def _stripe() -> Any:
    global _stripe_module
    if _stripe_module is None:
        import stripe  # type: ignore

        stripe.api_key = os.environ.get("STRIPE_SECRET_KEY", "")
        _stripe_module = stripe
    return _stripe_module


def register_stripe_for_tests(fake: Any) -> None:
    global _stripe_module
    _stripe_module = fake


class StripePaymentAdapter(PaymentAdapter):
    name = "stripe"

    def __init__(self, capture_method: str = "manual") -> None:
        self.capture_method = capture_method

    def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        minor_units = int((amount * 100).to_integral_value())
        intent = _stripe().PaymentIntent.create(
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

    def capture(self, intent_id: str) -> bool:
        try:
            res = _stripe().PaymentIntent.capture(intent_id)
            return res.get("status") == "succeeded"
        except Exception:  # noqa: BLE001
            return False

    def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        kwargs: dict[str, Any] = {"payment_intent": transaction_id}
        if amount is not None:
            kwargs["amount"] = int((amount * 100).to_integral_value())
        try:
            res = _stripe().Refund.create(**kwargs)
            return res.get("status") in {"succeeded", "pending"}
        except Exception:  # noqa: BLE001
            return False


def install_default() -> None:
    set_payment_adapter(StripePaymentAdapter())
