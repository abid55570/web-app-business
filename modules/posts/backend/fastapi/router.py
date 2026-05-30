"""FastAPI routes implementing posts@v1.

Two routers exported:
  - public_router  -> mounted at /api    (no auth required, published-only)
  - admin_router   -> mounted at /api/admin (auth required, full surface)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.posts.schemas import (
    PostCreate,
    PostListResponse,
    PostResponse,
    PostUpdate,
    StatusChange,
)
from app.posts.service import (
    PostError,
    change_status,
    create_post,
    delete_post,
    get_post,
    get_post_by_slug,
    list_posts,
    update_post,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get("/posts", response_model=PostListResponse, response_model_by_alias=True)
async def list_posts_public(
    db: Annotated[AsyncSession, Depends(get_db)],
    author_id: Annotated[str | None, Query(alias="authorId")] = None,
) -> PostListResponse:
    items = await list_posts(db, published_only=True, author_id=author_id)
    return PostListResponse(
        items=[PostResponse.model_validate(p) for p in items],
        total=len(items),
    )


@public_router.get(
    "/posts/{slug}",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def get_post_public(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PostResponse:
    post = await get_post_by_slug(db, slug)
    if post.status != "published":
        raise PostError("POST_NOT_FOUND", "Post not found.", status_code=404)
    return PostResponse.model_validate(post)


# ---- ADMIN ----


@admin_router.get("/posts", response_model=PostListResponse, response_model_by_alias=True)
async def list_posts_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
) -> PostListResponse:
    items = await list_posts(db, status=status_filter)
    return PostListResponse(
        items=[PostResponse.model_validate(p) for p in items],
        total=len(items),
    )


@admin_router.get(
    "/posts/{post_id}",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def get_post_admin(
    post_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> PostResponse:
    return PostResponse.model_validate(await get_post(db, post_id))


@admin_router.post(
    "/posts",
    response_model=PostResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_post_admin(
    body: PostCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> PostResponse:
    return PostResponse.model_validate(await create_post(db, user.id, body))


@admin_router.patch(
    "/posts/{post_id}",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def update_post_admin(
    post_id: str,
    body: PostUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> PostResponse:
    return PostResponse.model_validate(await update_post(db, post_id, body))


@admin_router.patch(
    "/posts/{post_id}/status",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def change_post_status(
    post_id: str,
    body: StatusChange,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> PostResponse:
    return PostResponse.model_validate(await change_status(db, post_id, body.status))


@admin_router.delete("/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_post_admin(
    post_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> None:
    await delete_post(db, post_id)
