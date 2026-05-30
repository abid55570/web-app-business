"""In-process event bus — implements events@v1.

Subscribers receive ``(payload, db)`` so they write within the caller's
transaction (PLAN §13). Handler exceptions are logged, not raised — best-effort
fan-out so one bad subscriber doesn't break the others.
"""
from collections.abc import Awaitable, Callable
from typing import Any

from loguru import logger
from sqlalchemy.ext.asyncio import AsyncSession


EventHandler = Callable[[dict[str, Any], AsyncSession], Awaitable[None]]


_subscribers: dict[str, list[EventHandler]] = {}


def subscribe(event_id: str, handler: EventHandler) -> None:
    """Register an async handler. Multiple handlers per event allowed."""
    _subscribers.setdefault(event_id, []).append(handler)


async def emit(event_id: str, payload: dict[str, Any], db: AsyncSession) -> None:
    """Emit. Calls every subscriber. Handler errors logged, not raised."""
    handlers = _subscribers.get(event_id, [])
    logger.debug("event.emit {} -> {} handlers", event_id, len(handlers))
    for handler in handlers:
        try:
            await handler(payload, db)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Subscriber for {} failed: {}", event_id, exc)


def clear_subscribers() -> None:
    """Reset registry. Test hook + lifespan cleanup."""
    _subscribers.clear()


def list_subscribers(event_id: str) -> list[EventHandler]:
    return list(_subscribers.get(event_id, []))


def all_event_ids() -> list[str]:
    return list(_subscribers.keys())
