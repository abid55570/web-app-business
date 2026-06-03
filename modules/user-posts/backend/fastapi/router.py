"""user-posts router — /api/my/posts CRUD scoped to the current user.

Why a separate module: the bare `posts` module gates create / update /
delete behind the admin role. Multi-tenant SaaS-style apps want any
signed-in user to author and manage their OWN posts. This module exposes
that thin shim — it imports the same Post model + service the admin
router uses, just with author_id pinned to current_user.id.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.database import get_db
from app.posts.schemas import (
    PostCreate,
    PostListResponse,
    PostResponse,
    PostUpdate,
    StatusChange,
)
from app.posts.service import (
    create_post,
    delete_post,
    get_post,
    list_posts,
    update_post,
    change_status,
)


router = APIRouter()


@router.get(
    "/posts",
    response_model=PostListResponse,
    response_model_by_alias=True,
)
async def list_my_posts(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> PostListResponse:
    """Return every post authored by the current user, newest first."""
    posts = await list_posts(db, author_id=user.id)
    return PostListResponse.model_validate({"items": posts, "total": len(posts)})


@router.get(
    "/posts/{post_id}",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def get_my_post(
    post_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> PostResponse:
    post = await get_post(db, post_id)
    if post.author_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your post.")
    return PostResponse.model_validate(post)


@router.post(
    "/posts",
    response_model=PostResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_my_post(
    body: PostCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> PostResponse:
    return PostResponse.model_validate(await create_post(db, user.id, body))


@router.patch(
    "/posts/{post_id}",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def update_my_post(
    post_id: str,
    body: PostUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> PostResponse:
    post = await get_post(db, post_id)
    if post.author_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your post.")
    return PostResponse.model_validate(await update_post(db, post_id, body))


@router.patch(
    "/posts/{post_id}/status",
    response_model=PostResponse,
    response_model_by_alias=True,
)
async def change_my_post_status(
    post_id: str,
    body: StatusChange,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> PostResponse:
    post = await get_post(db, post_id)
    if post.author_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your post.")
    return PostResponse.model_validate(await change_status(db, post_id, body.status))


@router.delete(
    "/posts/{post_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_my_post(
    post_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> None:
    post = await get_post(db, post_id)
    if post.author_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, detail="Not your post.")
    await delete_post(db, post_id)
