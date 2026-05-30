"""Per-module conftest — forces RazorpayPaymentAdapter active so the suite
is deterministic regardless of which other adapter modules' install_default
ran during app boot.
"""
import pytest


@pytest.fixture(autouse=True)
def _ensure_razorpay_installed():
    from app.payment_razorpay.adapters import install_default

    install_default()
    yield
