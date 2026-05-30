"""FastAPI routes implementing likes@v1.

Single router mounted at /api. Writes require a signed-in user; the
for-target read is anonymous-tolerant — anon callers see `likedByMe=false`.

  POST   /likes                   → toggle (auth)
  DELETE /likes?targetType&targetId → explicit remove (auth)
  GET    /likes/for-target?...    → { count, likedByMe }
  GET    /likes/my                → my likes (auth)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.auth_core.model import User
from app.auth_core.utils import decode_session_token
from app.database import get_db
from app.likes.schemas import (
    LikeCountResponse,
    LikeResponse,
    MyLike,
    MyLikesResponse,
    TargetRef,
)
from app.likes.service import (
    count_for_target,
    liked_by_me,
    my_likes,
    remove,
    toggle,
)


router = APIRouter()


async def _maybe_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,  # type: ignore[assignment]
) -> User | None:
    """Best-effort current-user resolver — returns None for anon callers
    instead of raising 401, so /likes/for-target can be public."""
    if not authorization or not authorization.startswith("Bearer "):
        return None
    token = authorization.removeprefix("Bearer ").strip()
    user_id = decode_session_token(token)
    if user_id is None:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        return None
    return user


@router.post("/likes", response_model=LikeResponse, response_model_by_alias=True)
async def toggle_like(
    body: TargetRef,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> LikeResponse:
    liked, count = await toggle(
        db,
        user_id=user.id,
        target_type=body.target_type,
        target_id=body.target_id,
    )
    return LikeResponse(
        target_type=body.target_type,
        target_id=body.target_id,
        liked=liked,
        count=count,
    )


@router.delete(
    "/likes", response_model=LikeResponse, response_model_by_alias=True
)
async def remove_like(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> LikeResponse:
    count = await remove(
        db, user_id=user.id, target_type=target_type, target_id=target_id
    )
    return LikeResponse(
        target_type=target_type,
        target_id=target_id,
        liked=False,
        count=count,
    )


@router.get(
    "/likes/for-target",
    response_model=LikeCountResponse,
    response_model_by_alias=True,
)
async def for_target(
    db: Annotated[AsyncSession, Depends(get_db)],
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
    user: Annotated[User | None, Depends(_maybe_current_user)] = None,
) -> LikeCountResponse:
    count = await count_for_target(
        db, target_type=target_type, target_id=target_id
    )
    mine = (
        await liked_by_me(
            db, user_id=user.id, target_type=target_type, target_id=target_id
        )
        if user is not None
        else False
    )
    return LikeCountResponse(
        target_type=target_type, target_id=target_id, count=count, liked_by_me=mine
    )


@router.get(
    "/likes/my", response_model=MyLikesResponse, response_model_by_alias=True
)
async def list_my_likes(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    target_type: Annotated[str | None, Query(alias="targetType")] = None,
) -> MyLikesResponse:
    rows = await my_likes(db, user_id=user.id, target_type=target_type)
    return MyLikesResponse(
        items=[
            MyLike(
                target_type=r.target_type,
                target_id=r.target_id,
                created_at=r.created_at,
            )
            for r in rows
        ],
        total=len(rows),
    )
