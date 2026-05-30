"""Per-app conftest — forces FakePaymentAdapter so orders tests don't try
to call the real Stripe gateway when payment-stripe also ships in the recipe.
"""
import pytest


@pytest.fixture(autouse=True)
def _ensure_fake_payment_adapter():
    from payment_fake.adapters import install_default

    install_default()
    yield
