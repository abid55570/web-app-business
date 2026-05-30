"""Bus subscriptions — Django sync edition.

Wired by ``NotificationsConfig.ready()`` at app startup. The function
signatures match events-bus (sync ``(payload, db)``); db is unused for
notifications since each dispatch creates its own row via the Django ORM.
"""
from typing import Any

from .service import DEFAULT_CHANNELS, dispatch


def handle_order_placed(payload: dict[str, Any], _db: Any = None) -> None:
    customer_id = payload.get("customerId", "")
    dispatch(
        channels=DEFAULT_CHANNELS,
        recipient=str(customer_id),
        template="order.placed",
        data=payload,
        triggered_by="order.placed",
    )


def handle_order_cancelled(payload: dict[str, Any], _db: Any = None) -> None:
    order_id = payload.get("orderId", "")
    dispatch(
        channels=DEFAULT_CHANNELS,
        recipient=str(order_id),
        template="order.cancelled",
        data=payload,
        triggered_by="order.cancelled",
    )
