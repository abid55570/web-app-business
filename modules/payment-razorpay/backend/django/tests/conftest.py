"""Per-app conftest — forces RazorpayPaymentAdapter active before each test."""
import pytest


@pytest.fixture(autouse=True)
def _ensure_razorpay_installed():
    from payment_razorpay.adapters import install_default

    install_default()
    yield
