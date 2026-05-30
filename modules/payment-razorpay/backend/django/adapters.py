"""payment-razorpay — Django sync adapter.

Same shape as the FastAPI version, sync method signatures.
"""
import os
from decimal import Decimal
from typing import Any
from uuid import uuid4

from payment_core.adapters import PaymentAdapter, set_payment_adapter


_client: Any | None = None


def _client_or_load() -> Any:
    global _client
    if _client is None:
        import razorpay  # type: ignore

        _client = razorpay.Client(
            auth=(
                os.environ.get("RAZORPAY_KEY_ID", ""),
                os.environ.get("RAZORPAY_KEY_SECRET", ""),
            )
        )
    return _client


def register_razorpay_for_tests(fake: Any) -> None:
    global _client
    _client = fake


class RazorpayPaymentAdapter(PaymentAdapter):
    name = "razorpay"

    def __init__(
        self,
        capture_method: str = "manual",
        account_currency: str = "INR",
    ) -> None:
        self.capture_method = capture_method
        self.account_currency = account_currency

    def create_intent(self, amount, currency, metadata=None):
        minor_units = int((amount * 100).to_integral_value())
        payload = {
            "amount": minor_units,
            "currency": (currency or self.account_currency).upper(),
            "payment_capture": 1 if self.capture_method == "automatic" else 0,
            "notes": metadata or {},
        }
        try:
            order = _client_or_load().order.create(data=payload)
        except Exception as exc:  # noqa: BLE001
            return {
                "intentId": f"rzp_failed_{uuid4().hex}",
                "status": "failed",
                "error": str(exc),
            }
        return {
            "intentId": order["id"],
            "clientSecret": None,
            "status": order.get("status", "created"),
        }

    def capture(self, intent_id: str) -> bool:
        try:
            _client_or_load().payment.capture(intent_id, None)
            return True
        except Exception:  # noqa: BLE001
            return False

    def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        kwargs: dict[str, Any] = {}
        if amount is not None:
            kwargs["amount"] = int((amount * 100).to_integral_value())
        try:
            _client_or_load().payment.refund(
                transaction_id, amount=kwargs.get("amount")
            )
            return True
        except Exception:  # noqa: BLE001
            return False


def install_default() -> None:
    set_payment_adapter(RazorpayPaymentAdapter())
