"""FastAPI routes implementing audit-log@v1.

Two routers:
  - public_router  -> /api       (auth required, signed-in users record events)
  - admin_router   -> /api/admin (CurrentAdmin reads with filters)
"""
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Query, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.audit_log.schemas import (
    AuditListResponse,
    AuditRecordBody,
    AuditResponse,
)
from app.audit_log.service import list_for_admin, record


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.post(
    "/audit",
    response_model=AuditResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def record_event(
    body: AuditRecordBody,
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> AuditResponse:
    ip = request.client.host if request.client else None
    ua = request.headers.get("user-agent")
    entry = await record(
        db,
        actor_id=user.id,
        action=body.action,
        target_type=body.target_type,
        target_id=body.target_id,
        metadata=body.metadata,
        ip=ip,
        user_agent=ua,
    )
    return AuditResponse.from_model(entry)


# ---- ADMIN ----


@admin_router.get(
    "/audit",
    response_model=AuditListResponse,
    response_model_by_alias=True,
)
async def list_audit_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    actor_id: Annotated[str | None, Query(alias="actorId")] = None,
    action: Annotated[str | None, Query()] = None,
    target_type: Annotated[str | None, Query(alias="targetType")] = None,
    target_id: Annotated[str | None, Query(alias="targetId")] = None,
    from_at: Annotated[datetime | None, Query(alias="from")] = None,
    to_at: Annotated[datetime | None, Query(alias="to")] = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 200,
) -> AuditListResponse:
    items = await list_for_admin(
        db,
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        from_at=from_at,
        to_at=to_at,
        limit=limit,
    )
    return AuditListResponse(
        items=[AuditResponse.from_model(e) for e in items],
        total=len(items),
    )
