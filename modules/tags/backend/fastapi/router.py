"""FastAPI routes implementing tags@v1.

Two routers:
  - public_router  -> /api    (read + lookups; no auth)
  - admin_router   -> /api/admin (full CRUD + assign/unassign; CurrentAdmin)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin
from app.database import get_db
from app.tags.schemas import (
    AssignBody,
    TagCreate,
    TagListResponse,
    TagResponse,
    TagUpdate,
    TagsForTargetResponse,
    TargetsForTagResponse,
)
from app.tags.service import (
    assign,
    create_tag,
    delete_tag,
    get_tag,
    get_tag_by_slug,
    list_tags,
    tags_for_target,
    targets_for_tag,
    unassign,
    update_tag,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get(
    "/tags", response_model=TagListResponse, response_model_by_alias=True
)
async def list_tags_public(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TagListResponse:
    items = await list_tags(db)
    return TagListResponse(
        items=[TagResponse.model_validate(t) for t in items],
        total=len(items),
    )


@public_router.get(
    "/tags/by-slug/{slug}",
    response_model=TagResponse,
    response_model_by_alias=True,
)
async def get_tag_by_slug_public(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> TagResponse:
    return TagResponse.model_validate(await get_tag_by_slug(db, slug))


@public_router.get(
    "/tags/for-target",
    response_model=TagsForTargetResponse,
    response_model_by_alias=True,
)
async def tags_for_target_public(
    db: Annotated[AsyncSession, Depends(get_db)],
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> TagsForTargetResponse:
    tags = await tags_for_target(
        db, target_type=target_type, target_id=target_id
    )
    return TagsForTargetResponse(
        target_type=target_type,
        target_id=target_id,
        tags=[TagResponse.model_validate(t) for t in tags],
    )


@public_router.get(
    "/tags/{tag_id}/targets",
    response_model=TargetsForTagResponse,
    response_model_by_alias=True,
)
async def targets_for_tag_public(
    tag_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    target_type: Annotated[str | None, Query(alias="targetType")] = None,
) -> TargetsForTagResponse:
    tag = await get_tag(db, tag_id)
    refs = await targets_for_tag(db, tag_id=tag_id, target_type=target_type)
    return TargetsForTagResponse(
        tag=TagResponse.model_validate(tag),
        targets=refs,
    )


# ---- ADMIN ----


@admin_router.get(
    "/tags", response_model=TagListResponse, response_model_by_alias=True
)
async def list_tags_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> TagListResponse:
    items = await list_tags(db)
    return TagListResponse(
        items=[TagResponse.model_validate(t) for t in items],
        total=len(items),
    )


@admin_router.post(
    "/tags",
    response_model=TagResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_tag_admin(
    body: TagCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> TagResponse:
    return TagResponse.model_validate(await create_tag(db, body))


@admin_router.patch(
    "/tags/{tag_id}",
    response_model=TagResponse,
    response_model_by_alias=True,
)
async def update_tag_admin(
    tag_id: str,
    body: TagUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> TagResponse:
    return TagResponse.model_validate(await update_tag(db, tag_id, body))


@admin_router.delete("/tags/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag_admin(
    tag_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> None:
    await delete_tag(db, tag_id)


@admin_router.post(
    "/tags/assign",
    response_model=TagsForTargetResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def assign_tag_admin(
    body: AssignBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> TagsForTargetResponse:
    await assign(
        db,
        tag_id=body.tag_id,
        target_type=body.target_type,
        target_id=body.target_id,
    )
    tags = await tags_for_target(
        db, target_type=body.target_type, target_id=body.target_id
    )
    return TagsForTargetResponse(
        target_type=body.target_type,
        target_id=body.target_id,
        tags=[TagResponse.model_validate(t) for t in tags],
    )


@admin_router.delete(
    "/tags/assign", status_code=status.HTTP_204_NO_CONTENT
)
async def unassign_tag_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    tag_id: Annotated[str, Query(alias="tagId")],
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> None:
    await unassign(
        db, tag_id=tag_id, target_type=target_type, target_id=target_id
    )
