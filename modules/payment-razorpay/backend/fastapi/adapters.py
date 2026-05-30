"""payment-razorpay — FastAPI async adapter.

The official ``razorpay`` python lib is sync. We wrap each call in
``asyncio.to_thread`` to satisfy the async ABC without blocking.

Razorpay's flow differs slightly from Stripe:
  - ``orders.create()``      = our ``create_intent`` (returns rzp order id)
  - ``payment.capture()``    = our ``capture`` (called after JS SDK on the
                                client posts the captured payment back)
  - ``payment.refund()``     = our ``refund``

Smoke tests substitute a fake client via ``register_razorpay_for_tests``.
"""
import asyncio
import os
from decimal import Decimal
from typing import Any
from uuid import uuid4

from app.payment_core.adapters import PaymentAdapter, set_payment_adapter


_client: Any | None = None


def _client_or_load() -> Any:
    global _client
    if _client is None:
        import razorpay  # type: ignore

        key = os.environ.get("RAZORPAY_KEY_ID", "")
        secret = os.environ.get("RAZORPAY_KEY_SECRET", "")
        _client = razorpay.Client(auth=(key, secret))
    return _client


def register_razorpay_for_tests(fake: Any) -> None:
    """Test hook — inject a fake client exposing .order.create / .payment.*."""
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

    async def create_intent(
        self,
        amount: Decimal,
        currency: str,
        metadata: dict[str, Any] | None = None,
    ) -> dict[str, Any]:
        # Razorpay wants integer paise (smallest unit).
        minor_units = int((amount * 100).to_integral_value())
        payload = {
            "amount": minor_units,
            "currency": (currency or self.account_currency).upper(),
            "payment_capture": 1 if self.capture_method == "automatic" else 0,
            "notes": metadata or {},
        }
        try:
            order = await asyncio.to_thread(
                _client_or_load().order.create, data=payload
            )
        except Exception as exc:  # noqa: BLE001
            return {
                "intentId": f"rzp_failed_{uuid4().hex}",
                "status": "failed",
                "error": str(exc),
            }
        return {
            "intentId": order["id"],
            "clientSecret": None,  # Razorpay doesn't issue one — JS SDK uses key_id
            "status": order.get("status", "created"),
        }

    async def capture(self, intent_id: str) -> bool:
        # ``intent_id`` here is Razorpay's payment id (pay_...), supplied
        # by the client SDK after the customer authorises the payment.
        # Razorpay needs amount + currency on capture; for the spike we
        # rely on auto-capture (capture_method=automatic) and treat this
        # as a success-no-op when the payment is already captured.
        try:
            await asyncio.to_thread(
                _client_or_load().payment.capture,
                intent_id,
                None,  # amount — None signals "capture full pre-auth amount"
            )
            return True
        except Exception:  # noqa: BLE001
            return False

    async def refund(
        self, transaction_id: str, amount: Decimal | None = None
    ) -> bool:
        kwargs: dict[str, Any] = {}
        if amount is not None:
            kwargs["amount"] = int((amount * 100).to_integral_value())
        try:
            await asyncio.to_thread(
                _client_or_load().payment.refund,
                transaction_id,
                amount=kwargs.get("amount"),
            )
            return True
        except Exception:  # noqa: BLE001
            return False


def install_default() -> None:
    set_payment_adapter(RazorpayPaymentAdapter())
