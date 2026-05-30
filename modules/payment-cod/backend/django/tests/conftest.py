"""Per-app conftest — forces CodPaymentAdapter active before each test."""
import pytest


@pytest.fixture(autouse=True)
def _ensure_cod_installed():
    from payment_cod.adapters import install_default

    install_default()
    yield
