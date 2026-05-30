"""Notifications admin router — read-only log viewer."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import get_current_admin
from app.auth_core.model import User
from app.database import get_db
from app.notifications import service
from app.notifications.schemas import (
    NotificationListResponse,
    NotificationLogResponse,
)


admin_router = APIRouter()


@admin_router.get("/notifications", response_model=NotificationListResponse)
async def list_notifications(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
    channel: Annotated[str | None, Query()] = None,
    event: Annotated[str | None, Query()] = None,
):
    rows = await service.list_logs(db, channel=channel, event=event)
    return NotificationListResponse(
        notifications=[NotificationLogResponse.from_model(r) for r in rows],
        total=len(rows),
    )
