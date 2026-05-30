"""Dispatch — fan out to channels, log every attempt, isolate failures.

Sync mirror of the FastAPI service. Each call creates one NotificationLog
row per channel; per-channel exceptions don't block siblings.
"""
from typing import Any

from events_bus.bus import emit

from .adapters import get_adapter
from .models import NotificationLog


DEFAULT_CHANNELS = ["in-app"]


def dispatch(
    *,
    channels: list[str],
    recipient: str,
    template: str,
    data: dict[str, Any],
    triggered_by: str | None = None,
) -> list[NotificationLog]:
    rows: list[NotificationLog] = []
    for channel in channels:
        adapter = get_adapter(channel)
        if adapter is None:
            row = NotificationLog.objects.create(
                channel=channel,
                recipient=recipient,
                template=template,
                payload=data,
                status="skipped",
                error="no adapter registered",
                triggered_by_event=triggered_by,
            )
            rows.append(row)
            continue
        try:
            res = adapter.send(recipient, template, data)
            row = NotificationLog.objects.create(
                channel=channel,
                recipient=recipient,
                template=template,
                payload=data,
                status=res.get("status", "sent"),
                provider_id=res.get("id"),
                triggered_by_event=triggered_by,
            )
            rows.append(row)
            emit(
                "notifications.sent",
                {
                    "id": str(row.pk),
                    "channel": channel,
                    "recipient": recipient,
                },
            )
        except Exception as exc:  # noqa: BLE001
            row = NotificationLog.objects.create(
                channel=channel,
                recipient=recipient,
                template=template,
                payload=data,
                status="failed",
                error=str(exc),
                triggered_by_event=triggered_by,
            )
            rows.append(row)
            emit(
                "notifications.failed",
                {
                    "id": str(row.pk),
                    "channel": channel,
                    "recipient": recipient,
                    "reason": str(exc),
                },
            )
    return rows
