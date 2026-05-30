"""FastAPI routes implementing comments@v1.

Two routers exported:
  - public_router  -> mounted at /api    (auth REQUIRED for write; read is open)
  - admin_router   -> mounted at /api/admin (auth required, moderator surface)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.comments.schemas import (
    CommentCreate,
    CommentListResponse,
    CommentResponse,
    CommentUpdate,
    StatusChange,
)
from app.comments.service import (
    admin_delete,
    change_status,
    create_comment,
    delete_own,
    list_all,
    list_for_target,
    update_own,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get(
    "/comments",
    response_model=CommentListResponse,
    response_model_by_alias=True,
)
async def list_comments_public(
    db: Annotated[AsyncSession, Depends(get_db)],
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> CommentListResponse:
    items = await list_for_target(
        db, target_type=target_type, target_id=target_id, include_hidden=False
    )
    return CommentListResponse(
        items=[CommentResponse.model_validate(c) for c in items],
        total=len(items),
    )


@public_router.post(
    "/comments",
    response_model=CommentResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_comment_public(
    body: CommentCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> CommentResponse:
    return CommentResponse.model_validate(
        await create_comment(db, author_id=user.id, body=body)
    )


@public_router.patch(
    "/comments/{comment_id}",
    response_model=CommentResponse,
    response_model_by_alias=True,
)
async def update_own_comment(
    comment_id: str,
    body: CommentUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> CommentResponse:
    return CommentResponse.model_validate(
        await update_own(db, comment_id=comment_id, author_id=user.id, body=body)
    )


@public_router.delete(
    "/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_own_comment(
    comment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> None:
    await delete_own(db, comment_id=comment_id, author_id=user.id)


# ---- ADMIN ----


@admin_router.get(
    "/comments",
    response_model=CommentListResponse,
    response_model_by_alias=True,
)
async def list_comments_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    target_type: Annotated[str | None, Query(alias="targetType")] = None,
) -> CommentListResponse:
    items = await list_all(db, status=status_filter, target_type=target_type)
    return CommentListResponse(
        items=[CommentResponse.model_validate(c) for c in items],
        total=len(items),
    )


@admin_router.patch(
    "/comments/{comment_id}/status",
    response_model=CommentResponse,
    response_model_by_alias=True,
)
async def moderate_comment(
    comment_id: str,
    body: StatusChange,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> CommentResponse:
    return CommentResponse.model_validate(
        await change_status(db, comment_id=comment_id, new_status=body.status)
    )


@admin_router.delete(
    "/comments/{comment_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_comment_admin(
    comment_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> None:
    await admin_delete(db, comment_id)
