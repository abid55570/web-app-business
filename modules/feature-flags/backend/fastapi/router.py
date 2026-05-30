"""FastAPI routes implementing feature-flags@v1.

Two routers:
  - public_router  -> /api       (anyone reads enabled state via `check`)
  - admin_router   -> /api/admin (CurrentAdmin manages flag rows)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin
from app.database import get_db
from app.feature_flags.schemas import (
    CheckResponse,
    FlagCreate,
    FlagListResponse,
    FlagResponse,
    FlagUpdate,
    PublicFlag,
    PublicListResponse,
)
from app.feature_flags.service import (
    create_flag,
    delete_flag,
    list_all,
    resolve,
    update_flag,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get(
    "/feature-flags/check/{key}",
    response_model=CheckResponse,
)
async def check_flag(
    key: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    audience: Annotated[str | None, Query()] = None,
) -> CheckResponse:
    enabled = await resolve(db, key=key, audience=audience)
    return CheckResponse(key=key, enabled=enabled, audience=audience)


@public_router.get(
    "/feature-flags",
    response_model=PublicListResponse,
)
async def list_public_flags(
    db: Annotated[AsyncSession, Depends(get_db)],
    audience: Annotated[str | None, Query()] = None,
) -> PublicListResponse:
    """Resolved snapshot for an audience — only `key` + `enabled` exposed,
    no rollout percentages or audience details leak to the client."""
    flags = await list_all(db)
    items = [
        PublicFlag(
            key=f.key, enabled=await resolve(db, key=f.key, audience=audience)
        )
        for f in flags
    ]
    return PublicListResponse(items=items, total=len(items))


# ---- ADMIN ----


@admin_router.get(
    "/feature-flags",
    response_model=FlagListResponse,
    response_model_by_alias=True,
)
async def list_flags_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> FlagListResponse:
    items = await list_all(db)
    return FlagListResponse(
        items=[FlagResponse.from_model(f) for f in items],
        total=len(items),
    )


@admin_router.post(
    "/feature-flags",
    response_model=FlagResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_flag_admin(
    body: FlagCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> FlagResponse:
    return FlagResponse.from_model(await create_flag(db, body))


@admin_router.patch(
    "/feature-flags/{flag_id}",
    response_model=FlagResponse,
    response_model_by_alias=True,
)
async def update_flag_admin(
    flag_id: str,
    body: FlagUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> FlagResponse:
    return FlagResponse.from_model(await update_flag(db, flag_id, body))


@admin_router.delete(
    "/feature-flags/{flag_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_flag_admin(
    flag_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> None:
    await delete_flag(db, flag_id)
