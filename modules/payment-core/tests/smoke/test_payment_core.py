"""payment-core smoke (FastAPI) — ABC + registry semantics."""
from decimal import Decimal

import pytest

from app.payment_core.adapters import (
    PaymentAdapter,
    clear_payment_adapter,
    get_payment_adapter,
    set_payment_adapter,
)


@pytest.fixture(autouse=True)
def _isolated_registry():
    """Snapshot + restore the registry around each test so payment-fake's
    side-effect-installed FakeAdapter survives the suite. Without this,
    payment-fake tests run after payment-core in alphabetical order would
    find an empty registry."""
    saved = None
    try:
        saved = get_payment_adapter()
    except RuntimeError:
        pass
    clear_payment_adapter()
    yield
    clear_payment_adapter()
    if saved is not None:
        set_payment_adapter(saved)


class _Stub(PaymentAdapter):
    name = "stub"

    async def create_intent(self, amount, currency, metadata=None):
        return {"intentId": "stub_1", "status": "ok"}

    async def capture(self, intent_id):
        return True

    async def refund(self, transaction_id, amount=None):
        return True


def test_get_without_registration_raises():
    with pytest.raises(RuntimeError, match="No payment adapter registered"):
        get_payment_adapter()


def test_set_then_get_returns_same_instance():
    s = _Stub()
    set_payment_adapter(s)
    assert get_payment_adapter() is s


def test_set_overrides_previous_registration():
    s1, s2 = _Stub(), _Stub()
    set_payment_adapter(s1)
    set_payment_adapter(s2)
    assert get_payment_adapter() is s2


def test_clear_resets_registry():
    set_payment_adapter(_Stub())
    clear_payment_adapter()
    with pytest.raises(RuntimeError):
        get_payment_adapter()


@pytest.mark.asyncio
async def test_abc_methods_are_abstract():
    with pytest.raises(TypeError, match="abstract"):
        PaymentAdapter()  # type: ignore[abstract]


@pytest.mark.asyncio
async def test_stub_satisfies_create_intent_contract():
    adapter = _Stub()
    res = await adapter.create_intent(Decimal("1.00"), "USD")
    assert res["intentId"] == "stub_1"
