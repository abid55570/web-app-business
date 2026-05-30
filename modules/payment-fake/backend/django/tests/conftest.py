"""Per-app conftest — forces FakePaymentAdapter active before each test."""
import pytest


@pytest.fixture(autouse=True)
def _ensure_fake_installed():
    from payment_fake.adapters import install_default

    install_default()
    yield
