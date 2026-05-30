"""In-process pub/sub — Django sync edition.

Same semantic contract as the FastAPI ``app.events_bus.bus`` module
(events@v1, PLAN §13): subscribers receive ``(payload, db)`` so they can
write inside the caller's transaction; handler exceptions are logged but
not propagated so one bad subscriber doesn't break the others.

Difference from the FastAPI version: handlers + emit are SYNC. Django views
are sync by default and DRF's request lifecycle is sync. Emitting from an
async view is fine — the handler chain just runs synchronously inside the
event loop. Wiring happens in each subscribing app's ``AppConfig.ready()``
hook (no derive-subscriptions step needed for Django).
"""
import logging
from collections.abc import Callable
from typing import Any


logger = logging.getLogger(__name__)


EventHandler = Callable[[dict[str, Any], Any], None]


_subscribers: dict[str, list[EventHandler]] = {}


def subscribe(event_id: str, handler: EventHandler) -> None:
    """Register a sync handler. Multiple handlers per event allowed."""
    _subscribers.setdefault(event_id, []).append(handler)


def emit(event_id: str, payload: dict[str, Any], db: Any = None) -> None:
    """Emit. Calls every subscriber. Handler errors logged, not raised."""
    handlers = _subscribers.get(event_id, [])
    logger.debug("event.emit %s -> %d handlers", event_id, len(handlers))
    for handler in handlers:
        try:
            handler(payload, db)
        except Exception:  # noqa: BLE001
            logger.exception("Subscriber for %s failed", event_id)


def clear_subscribers() -> None:
    """Reset registry. Test hook."""
    _subscribers.clear()


def list_subscribers(event_id: str) -> list[EventHandler]:
    return list(_subscribers.get(event_id, []))


def all_event_ids() -> list[str]:
    return list(_subscribers.keys())
