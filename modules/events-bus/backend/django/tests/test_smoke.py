"""events-bus Django smoke — sync pub/sub fan-out + exception isolation."""
import pytest

from events_bus.bus import (
    all_event_ids,
    clear_subscribers,
    emit,
    list_subscribers,
    subscribe,
)


@pytest.fixture(autouse=True)
def _isolated_bus():
    # Snapshot + restore so registrations made by other apps' ready() hooks
    # (e.g. notifications subscribing to order.placed) survive the test.
    snapshot = dict(
        (k, list(v))
        for k, v in [(eid, list_subscribers(eid)) for eid in all_event_ids()]
    )
    clear_subscribers()
    yield
    clear_subscribers()
    for eid, handlers in snapshot.items():
        for h in handlers:
            subscribe(eid, h)


def test_emit_calls_subscribed_handler():
    seen: list[dict] = []

    def handler(payload, _db):
        seen.append(payload)

    subscribe("test.event", handler)
    emit("test.event", {"x": 1})

    assert seen == [{"x": 1}]


def test_multi_handler_fanout_in_registration_order():
    counts: list[str] = []

    def h1(_p, _db):
        counts.append("h1")

    def h2(_p, _db):
        counts.append("h2")

    subscribe("evt", h1)
    subscribe("evt", h2)
    emit("evt", {})

    assert counts == ["h1", "h2"]


def test_handler_exception_does_not_break_siblings():
    seen: list[str] = []

    def bad(_p, _db):
        raise RuntimeError("boom")

    def good(_p, _db):
        seen.append("ok")

    subscribe("evt", bad)
    subscribe("evt", good)
    emit("evt", {})

    assert seen == ["ok"]


def test_emit_with_no_subscribers_is_noop():
    emit("nobody.listens", {})  # must not raise


def test_clear_subscribers_resets_registry():
    def h(_p, _db):
        pass

    subscribe("a.event", h)
    subscribe("b.event", h)
    assert set(all_event_ids()) >= {"a.event", "b.event"}

    clear_subscribers()
    assert all_event_ids() == []
