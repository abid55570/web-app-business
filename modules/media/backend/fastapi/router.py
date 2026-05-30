"""FastAPI routes implementing media@v1.

Single router at /api. Reads are public; writes require auth + owner.

  GET    /media[?ownerId=&kind=]     → public list (paginate later)
  GET    /media/{id}                 → public detail
  GET    /media/my                   → owner's own (auth)
  POST   /media                      → register metadata for an already-uploaded asset (auth)
  PATCH  /media/{id}                 → owner-only edit (altText / thumbUrl)
  DELETE /media/{id}                 → owner-only delete
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.database import get_db
from app.media.schemas import (
    MediaListResponse,
    MediaRegisterBody,
    MediaResponse,
    MediaUpdate,
)
from app.media.service import (
    delete_own,
    get_media,
    list_my,
    list_public,
    register,
    update_own,
)


router = APIRouter()


@router.get(
    "/media",
    response_model=MediaListResponse,
    response_model_by_alias=True,
)
async def list_media(
    db: Annotated[AsyncSession, Depends(get_db)],
    owner_id: Annotated[str | None, Query(alias="ownerId")] = None,
    kind: Annotated[str | None, Query()] = None,
) -> MediaListResponse:
    items = await list_public(db, owner_id=owner_id, kind=kind)
    return MediaListResponse(
        items=[MediaResponse.model_validate(m) for m in items],
        total=len(items),
    )


@router.get(
    "/media/my",
    response_model=MediaListResponse,
    response_model_by_alias=True,
)
async def my_media(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> MediaListResponse:
    items = await list_my(db, user.id)
    return MediaListResponse(
        items=[MediaResponse.model_validate(m) for m in items],
        total=len(items),
    )


@router.get(
    "/media/{media_id}",
    response_model=MediaResponse,
    response_model_by_alias=True,
)
async def get_media_endpoint(
    media_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MediaResponse:
    return MediaResponse.model_validate(await get_media(db, media_id))


@router.post(
    "/media",
    response_model=MediaResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def register_media(
    body: MediaRegisterBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> MediaResponse:
    return MediaResponse.model_validate(
        await register(db, owner_id=user.id, body=body)
    )


@router.patch(
    "/media/{media_id}",
    response_model=MediaResponse,
    response_model_by_alias=True,
)
async def update_media(
    media_id: str,
    body: MediaUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> MediaResponse:
    return MediaResponse.model_validate(
        await update_own(db, media_id=media_id, owner_id=user.id, body=body)
    )


@router.delete("/media/{media_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_media(
    media_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> None:
    await delete_own(db, media_id=media_id, owner_id=user.id)
