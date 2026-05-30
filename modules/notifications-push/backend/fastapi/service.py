"""notifications-push business logic.

`dispatch()` is the integration seam other modules call (typically via
the notifications-core channel registry on a `notifications.sent` bus
event). It walks the user's PushSubscription rows and POSTs the payload
to each endpoint. 404/410 responses unsubscribe the dead endpoint.

The actual VAPID signing happens in `_send_one()` — real impl uses
`pywebpush`; this module exposes a small surface so the test harness can
monkey-patch the network call.
"""
from __future__ import annotations

import logging
import os

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.events_bus.bus import bus
from app.notifications_push.model import PushSubscription
from app.notifications_push.schemas import SubscribeBody


logger = logging.getLogger(__name__)


# Real impl in app would use `pywebpush.webpush(...)`. We expose a hook so
# tests can flip the result without spinning up a real push service.
async def _send_one(subscription: PushSubscription, payload: dict) -> str:
    """Returns "delivered" / "expired" / "failed"."""
    return "delivered"


async def list_for_user(
    db: AsyncSession, user_id: str
) -> list[PushSubscription]:
    stmt = (
        select(PushSubscription)
        .where(PushSubscription.user_id == user_id)
        .order_by(PushSubscription.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars())


async def subscribe(
    db: AsyncSession, *, user_id: str, body: SubscribeBody, user_agent: str | None
) -> PushSubscription:
    sub = PushSubscription(
        user_id=user_id,
        endpoint=body.endpoint,
        p256dh_key=body.p256dh_key,
        auth_key=body.auth_key,
        user_agent=user_agent,
    )
    db.add(sub)
    try:
        await db.commit()
        await db.refresh(sub)
    except IntegrityError:
        # Already subscribed with this endpoint — fetch the existing row.
        await db.rollback()
        existing = await db.execute(
            select(PushSubscription).where(
                PushSubscription.user_id == user_id,
                PushSubscription.endpoint == body.endpoint,
            )
        )
        sub = existing.scalar_one()
        # Refresh keys in case the browser rotated them.
        sub.p256dh_key = body.p256dh_key
        sub.auth_key = body.auth_key
        sub.user_agent = user_agent
        await db.commit()
        await db.refresh(sub)
        return sub

    await bus.emit(
        "notifications.push.subscribed",
        {"id": sub.id, "userId": sub.user_id},
    )
    return sub


async def unsubscribe(db: AsyncSession, *, user_id: str, endpoint: str) -> bool:
    existing = await db.execute(
        select(PushSubscription).where(
            PushSubscription.user_id == user_id,
            PushSubscription.endpoint == endpoint,
        )
    )
    sub = existing.scalar_one_or_none()
    if sub is None:
        return False
    await bus.emit(
        "notifications.push.unsubscribed",
        {"id": sub.id, "userId": sub.user_id},
    )
    await db.delete(sub)
    await db.commit()
    return True


async def dispatch(
    db: AsyncSession, *, user_id: str, payload: dict
) -> tuple[int, int]:
    """Returns (delivered_count, expired_count). Expired endpoints are
    deleted in this same call so retries don't keep hitting them."""
    subs = await list_for_user(db, user_id)
    delivered = 0
    expired_ids: list[str] = []
    for sub in subs:
        outcome = await _send_one(sub, payload)
        if outcome == "delivered":
            delivered += 1
        elif outcome == "expired":
            expired_ids.append(sub.id)

    for sub_id in expired_ids:
        await db.execute(
            PushSubscription.__table__.delete().where(
                PushSubscription.id == sub_id
            )
        )
        await bus.emit(
            "notifications.push.expired",
            {"id": sub_id, "userId": user_id},
        )
    if expired_ids:
        await db.commit()

    await bus.emit(
        "notifications.push.sent",
        {"id": user_id, "userId": user_id, "deliveredCount": delivered},
    )
    return delivered, len(expired_ids)


def vapid_public_key() -> str:
    """Browser needs this to call `pushManager.subscribe({ userVisibleOnly,
    applicationServerKey })`. Reads env at call time so tests can override."""
    return os.getenv("VAPID_PUBLIC_KEY", "")
