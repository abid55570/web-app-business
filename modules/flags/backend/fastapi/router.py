"""FastAPI routes implementing flags@v1.

Two routers:
  - public_router  -> /api     (auth required, signed-in users open flags)
  - admin_router   -> /api/admin (CurrentAdmin reads + resolves)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.flags.schemas import (
    FlagCreate,
    FlagListResponse,
    FlagResponse,
    ResolveBody,
)
from app.flags.service import (
    list_for_admin,
    list_for_target_admin,
    open_flag,
    resolve,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.post(
    "/flags",
    response_model=FlagResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def open_flag_public(
    body: FlagCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> FlagResponse:
    return FlagResponse.model_validate(
        await open_flag(db, reporter_id=user.id, body=body)
    )


# ---- ADMIN ----


@admin_router.get(
    "/flags",
    response_model=FlagListResponse,
    response_model_by_alias=True,
)
async def list_flags_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    target_type: Annotated[str | None, Query(alias="targetType")] = None,
) -> FlagListResponse:
    items = await list_for_admin(
        db, status=status_filter, target_type=target_type
    )
    return FlagListResponse(
        items=[FlagResponse.model_validate(f) for f in items],
        total=len(items),
    )


@admin_router.get(
    "/flags/for-target",
    response_model=FlagListResponse,
    response_model_by_alias=True,
)
async def list_for_target_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> FlagListResponse:
    items = await list_for_target_admin(
        db, target_type=target_type, target_id=target_id
    )
    return FlagListResponse(
        items=[FlagResponse.model_validate(f) for f in items],
        total=len(items),
    )


@admin_router.patch(
    "/flags/{flag_id}",
    response_model=FlagResponse,
    response_model_by_alias=True,
)
async def resolve_flag(
    flag_id: str,
    body: ResolveBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    admin: CurrentAdmin,
) -> FlagResponse:
    return FlagResponse.model_validate(
        await resolve(
            db,
            flag_id=flag_id,
            resolver_id=admin.id,
            new_status=body.status,
            note=body.note,
        )
    )
