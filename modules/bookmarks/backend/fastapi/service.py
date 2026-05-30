"""bookmarks business logic — every action is user-scoped.

`save()` is idempotent: re-saving the same target with a new `note` updates
the existing row's note + updated_at instead of failing on the unique
constraint. That's the natural UX (the user just changed their mind about
the note).
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events_bus.bus import bus
from app.bookmarks.model import Bookmark


async def save(
    db: AsyncSession,
    *,
    user_id: str,
    target_type: str,
    target_id: str,
    note: str | None,
) -> Bookmark:
    existing = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user_id,
            Bookmark.target_type == target_type,
            Bookmark.target_id == target_id,
        )
    )
    row = existing.scalar_one_or_none()
    if row is not None:
        # idempotent — refresh note if changed
        if note is not None and note != row.note:
            row.note = note
            await db.commit()
            await db.refresh(row)
        return row

    bm = Bookmark(
        user_id=user_id,
        target_type=target_type,
        target_id=target_id,
        note=note,
    )
    db.add(bm)
    await db.commit()
    await db.refresh(bm)
    await bus.emit(
        "bookmarks.added",
        {"userId": user_id, "targetType": target_type, "targetId": target_id},
    )
    return bm


async def remove(
    db: AsyncSession, *, user_id: str, target_type: str, target_id: str
) -> None:
    existing = await db.execute(
        select(Bookmark).where(
            Bookmark.user_id == user_id,
            Bookmark.target_type == target_type,
            Bookmark.target_id == target_id,
        )
    )
    row = existing.scalar_one_or_none()
    if row is None:
        return  # idempotent
    await db.delete(row)
    await db.commit()
    await bus.emit(
        "bookmarks.removed",
        {"userId": user_id, "targetType": target_type, "targetId": target_id},
    )


async def is_bookmarked(
    db: AsyncSession, *, user_id: str, target_type: str, target_id: str
) -> bool:
    stmt = select(Bookmark.id).where(
        Bookmark.user_id == user_id,
        Bookmark.target_type == target_type,
        Bookmark.target_id == target_id,
    )
    return (await db.execute(stmt)).first() is not None


async def list_my(
    db: AsyncSession, *, user_id: str, target_type: str | None = None
) -> list[Bookmark]:
    stmt = (
        select(Bookmark)
        .where(Bookmark.user_id == user_id)
        .order_by(Bookmark.created_at.desc())
    )
    if target_type:
        stmt = stmt.where(Bookmark.target_type == target_type)
    return list((await db.execute(stmt)).scalars())
