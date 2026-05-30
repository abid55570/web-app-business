"""Per-module conftest — forces FakePaymentAdapter into the registry
before each test so payment_fake's suite is deterministic regardless of
which other adapter modules' install_default ran last during app boot.
"""
import pytest


@pytest.fixture(autouse=True)
def _ensure_fake_installed():
    from app.payment_fake.adapters import install_default

    install_default()
    yield
