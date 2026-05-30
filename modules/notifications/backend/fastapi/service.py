"""Dispatch service — fan out to channels, log every attempt, isolate failures."""
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events_bus.bus import emit
from app.notifications.adapters import get_adapter
from app.notifications.model import NotificationLog


DEFAULT_CHANNELS = ["in-app"]


async def dispatch(
    db: AsyncSession,
    *,
    channels: list[str],
    recipient: str,
    template: str,
    data: dict[str, Any],
    triggered_by: str | None = None,
) -> list[NotificationLog]:
    """One log row per channel. Per-channel exceptions don't block siblings."""
    rows: list[NotificationLog] = []
    for channel in channels:
        adapter = get_adapter(channel)
        if adapter is None:
            row = NotificationLog(
                channel=channel,
                recipient=recipient,
                template=template,
                payload=data,
                status="skipped",
                error="no adapter registered",
                triggered_by_event=triggered_by,
            )
            db.add(row)
            rows.append(row)
            continue
        try:
            res = await adapter.send(recipient, template, data)
            row = NotificationLog(
                channel=channel,
                recipient=recipient,
                template=template,
                payload=data,
                status=res.get("status", "sent"),
                provider_id=res.get("id"),
                triggered_by_event=triggered_by,
            )
            db.add(row)
            rows.append(row)
            await db.flush()
            await emit(
                "notifications.sent",
                {
                    "id": str(row.id),
                    "channel": channel,
                    "recipient": recipient,
                },
                db,
            )
        except Exception as exc:  # noqa: BLE001
            row = NotificationLog(
                channel=channel,
                recipient=recipient,
                template=template,
                payload=data,
                status="failed",
                error=str(exc),
                triggered_by_event=triggered_by,
            )
            db.add(row)
            rows.append(row)
            await db.flush()
            await emit(
                "notifications.failed",
                {
                    "id": str(row.id),
                    "channel": channel,
                    "recipient": recipient,
                    "reason": str(exc),
                },
                db,
            )
    return rows


async def list_logs(
    db: AsyncSession,
    *,
    channel: str | None = None,
    event: str | None = None,
) -> list[NotificationLog]:
    stmt = select(NotificationLog).order_by(NotificationLog.sent_at.desc())
    if channel:
        stmt = stmt.where(NotificationLog.channel == channel)
    if event:
        stmt = stmt.where(NotificationLog.triggered_by_event == event)
    res = await db.execute(stmt)
    return list(res.scalars().all())
