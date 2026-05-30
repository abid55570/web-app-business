"""payment-stripe smoke (FastAPI) — verify the adapter satisfies payment@v1
without a live Stripe key by injecting a fake stripe module.
"""
from decimal import Decimal
from types import SimpleNamespace

import pytest

from app.payment_fake.adapters import PaymentAdapter
from app.payment_stripe.adapters import (
    StripePaymentAdapter,
    register_stripe_for_tests,
)


class _FakePaymentIntent:
    @staticmethod
    def create(**kwargs):
        # Mirror Stripe's response shape for the bits we read.
        return {
            "id": f"pi_{kwargs.get('amount', 0)}_{kwargs.get('currency', 'usd')}",
            "client_secret": "secret_xyz",
            "status": "requires_capture",
        }

    @staticmethod
    def capture(intent_id):
        return {"id": intent_id, "status": "succeeded"}


class _FakeRefund:
    @staticmethod
    def create(**kwargs):
        return {"id": "re_1", "status": "succeeded"}


@pytest.fixture(autouse=True)
def _swap_stripe_module():
    register_stripe_for_tests(
        SimpleNamespace(PaymentIntent=_FakePaymentIntent, Refund=_FakeRefund)
    )
    yield
    # Reset so other tests get a fresh injection if they need one.
    register_stripe_for_tests(None)  # type: ignore[arg-type]


def test_implements_payment_adapter_abc():
    assert isinstance(StripePaymentAdapter(), PaymentAdapter)


@pytest.mark.asyncio
async def test_create_intent_converts_to_minor_units_and_returns_envelope():
    adapter = StripePaymentAdapter()
    intent = await adapter.create_intent(Decimal("12.50"), "USD")

    assert intent["intentId"].startswith("pi_1250_usd")
    assert intent["clientSecret"] == "secret_xyz"
    assert intent["status"] == "requires_capture"


@pytest.mark.asyncio
async def test_capture_returns_true_on_succeeded_status():
    adapter = StripePaymentAdapter()
    assert await adapter.capture("pi_test_1") is True


@pytest.mark.asyncio
async def test_refund_full_succeeds():
    adapter = StripePaymentAdapter()
    assert await adapter.refund("pi_test_1") is True


@pytest.mark.asyncio
async def test_refund_partial_passes_amount_in_minor_units():
    captured: dict = {}

    class _Refund:
        @staticmethod
        def create(**kwargs):
            captured.update(kwargs)
            return {"id": "re_2", "status": "succeeded"}

    register_stripe_for_tests(
        SimpleNamespace(PaymentIntent=_FakePaymentIntent, Refund=_Refund)
    )
    adapter = StripePaymentAdapter()
    assert await adapter.refund("pi_test_1", Decimal("4.20")) is True
    assert captured["payment_intent"] == "pi_test_1"
    assert captured["amount"] == 420  # cents


@pytest.mark.asyncio
async def test_capture_returns_false_when_stripe_raises():
    class _Boom:
        @staticmethod
        def capture(_id):
            raise RuntimeError("API error")

    register_stripe_for_tests(
        SimpleNamespace(PaymentIntent=_Boom, Refund=_FakeRefund)
    )
    adapter = StripePaymentAdapter()
    assert await adapter.capture("pi_test_1") is False
