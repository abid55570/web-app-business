"""Per-module conftest — forces CodPaymentAdapter active before each test
so payment_cod tests are deterministic regardless of which other adapter
modules' install_default ran last during app boot.
"""
import pytest


@pytest.fixture(autouse=True)
def _ensure_cod_installed():
    from app.payment_cod.adapters import install_default

    install_default()
    yield
