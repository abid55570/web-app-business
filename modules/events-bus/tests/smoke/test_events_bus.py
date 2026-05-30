"""events@v1 smoke — pub/sub, multi-handler fan-out, exception isolation."""
import pytest

from app.events_bus.bus import (
    all_event_ids,
    clear_subscribers,
    emit,
    list_subscribers,
    subscribe,
)


@pytest.fixture(autouse=True)
def _clear_bus():
    clear_subscribers()
    yield
    clear_subscribers()


@pytest.mark.asyncio
async def test_emit_calls_subscribed_handler():
    seen = []

    async def handler(payload, db):
        seen.append(payload)

    subscribe("test.event", handler)
    await emit("test.event", {"x": 1}, db=None)

    assert seen == [{"x": 1}]


@pytest.mark.asyncio
async def test_multi_handler_fanout_in_registration_order():
    counts: list[str] = []

    async def h1(p, _):
        counts.append("h1")

    async def h2(p, _):
        counts.append("h2")

    subscribe("evt", h1)
    subscribe("evt", h2)
    await emit("evt", {}, db=None)

    assert counts == ["h1", "h2"]


@pytest.mark.asyncio
async def test_handler_exception_does_not_break_siblings():
    seen: list[str] = []

    async def bad(_p, _db):
        raise RuntimeError("boom")

    async def good(_p, _db):
        seen.append("ok")

    subscribe("evt", bad)
    subscribe("evt", good)
    await emit("evt", {}, db=None)

    # `good` still ran despite `bad` raising — best-effort fan-out (PLAN §13).
    assert seen == ["ok"]


@pytest.mark.asyncio
async def test_emit_with_no_subscribers_is_noop():
    # Must not raise.
    await emit("nobody.listens", {}, db=None)


def test_clear_subscribers_resets_registry():
    async def h(_p, _db):
        pass

    subscribe("a.event", h)
    subscribe("b.event", h)
    assert set(all_event_ids()) >= {"a.event", "b.event"}

    clear_subscribers()
    assert all_event_ids() == []
    assert list_subscribers("a.event") == []
