"""Bus subscriptions. Wirer registers these against the events bus at startup
based on the ``subscribes`` block in module.yaml (PLAN §13).
"""
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.notifications.service import DEFAULT_CHANNELS, dispatch


async def handle_order_placed(payload: dict[str, Any], db: AsyncSession) -> None:
    customer_id = payload.get("customerId", "")
    await dispatch(
        db,
        channels=DEFAULT_CHANNELS,
        recipient=str(customer_id),
        template="order.placed",
        data=payload,
        triggered_by="order.placed",
    )


async def handle_order_cancelled(payload: dict[str, Any], db: AsyncSession) -> None:
    order_id = payload.get("orderId", "")
    await dispatch(
        db,
        channels=DEFAULT_CHANNELS,
        recipient=str(order_id),
        template="order.cancelled",
        data=payload,
        triggered_by="order.cancelled",
    )
