"""FastAPI routes implementing bookmarks@v1.

Single router mounted at /api. Every endpoint requires a signed-in user
since bookmarks are private — there is no anonymous read surface.

  POST   /bookmarks                         → save (idempotent — updates note if changed)
  DELETE /bookmarks?targetType&targetId     → remove (idempotent)
  GET    /bookmarks/check?targetType&id     → { bookmarked: bool }
  GET    /bookmarks/my[?targetType=…]       → my saves, newest first
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.database import get_db
from app.bookmarks.schemas import (
    BookmarkListResponse,
    BookmarkResponse,
    BookmarkSaveBody,
    CheckResponse,
)
from app.bookmarks.service import is_bookmarked, list_my, remove, save


router = APIRouter()


@router.post(
    "/bookmarks",
    response_model=BookmarkResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def save_bookmark(
    body: BookmarkSaveBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> BookmarkResponse:
    bm = await save(
        db,
        user_id=user.id,
        target_type=body.target_type,
        target_id=body.target_id,
        note=body.note,
    )
    return BookmarkResponse.model_validate(bm)


@router.delete("/bookmarks", status_code=status.HTTP_204_NO_CONTENT)
async def remove_bookmark(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> None:
    await remove(
        db, user_id=user.id, target_type=target_type, target_id=target_id
    )


@router.get(
    "/bookmarks/check",
    response_model=CheckResponse,
    response_model_by_alias=True,
)
async def check_bookmark(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    target_type: Annotated[str, Query(alias="targetType")],
    target_id: Annotated[str, Query(alias="targetId")],
) -> CheckResponse:
    return CheckResponse(
        target_type=target_type,
        target_id=target_id,
        bookmarked=await is_bookmarked(
            db, user_id=user.id, target_type=target_type, target_id=target_id
        ),
    )


@router.get(
    "/bookmarks/my",
    response_model=BookmarkListResponse,
    response_model_by_alias=True,
)
async def my_bookmarks(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    target_type: Annotated[str | None, Query(alias="targetType")] = None,
) -> BookmarkListResponse:
    items = await list_my(db, user_id=user.id, target_type=target_type)
    return BookmarkListResponse(
        items=[BookmarkResponse.model_validate(b) for b in items],
        total=len(items),
    )
