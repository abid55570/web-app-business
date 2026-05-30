"""media business logic — owner-only writes, anyone-reads."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.media.model import Media
from app.media.schemas import MediaRegisterBody, MediaUpdate


class MediaError(AppError):
    """Raised by the media service."""


async def register(
    db: AsyncSession, *, owner_id: str, body: MediaRegisterBody
) -> Media:
    m = Media(
        owner_id=owner_id,
        kind=body.kind,
        original_name=body.original_name,
        mime_type=body.mime_type,
        size_bytes=body.size_bytes,
        url=body.url,
        thumb_url=body.thumb_url,
        width=body.width,
        height=body.height,
        alt_text=body.alt_text,
    )
    db.add(m)
    await db.commit()
    await db.refresh(m)
    await bus.emit(
        "media.registered",
        {"id": m.id, "ownerId": m.owner_id, "kind": m.kind, "url": m.url},
    )
    return m


async def get_media(db: AsyncSession, media_id: str) -> Media:
    result = await db.execute(select(Media).where(Media.id == media_id))
    m = result.scalar_one_or_none()
    if m is None:
        raise MediaError("MEDIA_NOT_FOUND", "Media not found.", status_code=404)
    return m


async def list_public(
    db: AsyncSession,
    *,
    owner_id: str | None = None,
    kind: str | None = None,
) -> list[Media]:
    stmt = select(Media).order_by(Media.created_at.desc())
    if owner_id:
        stmt = stmt.where(Media.owner_id == owner_id)
    if kind:
        stmt = stmt.where(Media.kind == kind)
    return list((await db.execute(stmt)).scalars())


async def list_my(db: AsyncSession, owner_id: str) -> list[Media]:
    stmt = (
        select(Media)
        .where(Media.owner_id == owner_id)
        .order_by(Media.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars())


async def update_own(
    db: AsyncSession, *, media_id: str, owner_id: str, body: MediaUpdate
) -> Media:
    m = await get_media(db, media_id)
    if m.owner_id != owner_id:
        raise MediaError(
            "AUTH_FORBIDDEN",
            "Only the asset owner can edit this media.",
            status_code=403,
        )
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(m, key, value)
    await db.commit()
    await db.refresh(m)
    return m


async def delete_own(
    db: AsyncSession, *, media_id: str, owner_id: str
) -> None:
    m = await get_media(db, media_id)
    if m.owner_id != owner_id:
        raise MediaError(
            "AUTH_FORBIDDEN",
            "Only the asset owner can delete this media.",
            status_code=403,
        )
    await db.delete(m)
    await db.commit()
    await bus.emit("media.deleted", {"id": media_id})
