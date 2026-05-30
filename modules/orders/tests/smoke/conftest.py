"""Per-module conftest — forces FakePaymentAdapter into the registry so
orders tests don't try to call a real Stripe gateway when payment-stripe
also ships in the recipe.
"""
import pytest


@pytest.fixture(autouse=True)
def _ensure_fake_payment_adapter():
    from app.payment_fake.adapters import install_default

    install_default()
    yield
