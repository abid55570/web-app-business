"""Per-app conftest — forces BankTransferPaymentAdapter active."""
import pytest


@pytest.fixture(autouse=True)
def _ensure_banktransfer_installed():
    from payment_banktransfer.adapters import install_default

    install_default()
    yield
