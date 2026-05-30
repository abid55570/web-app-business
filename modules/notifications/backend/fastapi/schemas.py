"""Pydantic schemas mirroring notifications@v1 contract.

IDs serialize as ``str`` to stay consistent with ``User.id`` /
``Order.id`` which are 36-char UUID-strings.
"""
from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel


Channel = Literal["email", "sms", "whatsapp", "push", "in-app"]
NotifStatus = Literal["sent", "sent-test", "failed", "skipped"]


class NotificationLogResponse(BaseModel):
    id: str
    channel: Channel
    recipient: str
    template: str
    payload: dict[str, Any] | None = None
    status: NotifStatus
    providerId: str | None = None
    error: str | None = None
    triggeredByEvent: str | None = None
    sentAt: datetime

    @classmethod
    def from_model(cls, m) -> "NotificationLogResponse":
        return cls(
            id=m.id,
            channel=m.channel,
            recipient=m.recipient,
            template=m.template,
            payload=m.payload,
            status=m.status,
            providerId=m.provider_id,
            error=m.error,
            triggeredByEvent=m.triggered_by_event,
            sentAt=m.sent_at,
        )


class NotificationListResponse(BaseModel):
    notifications: list[NotificationLogResponse]
    total: int
