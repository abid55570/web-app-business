"""likes business logic — toggle + count + per-target liked-by-me.

Every mutation is bounded to the caller's `user_id` so there's no admin
moderation surface in v1; a user can only add/remove their own likes.
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events_bus.bus import bus
from app.likes.model import Like


async def toggle(
    db: AsyncSession, *, user_id: str, target_type: str, target_id: str
) -> tuple[bool, int]:
    """Returns (liked, count) — `liked` is True if the toggle resulted in
    a like, False if it removed an existing like."""
    existing = await db.execute(
        select(Like).where(
            Like.user_id == user_id,
            Like.target_type == target_type,
            Like.target_id == target_id,
        )
    )
    row = existing.scalar_one_or_none()

    if row is None:
        like = Like(user_id=user_id, target_type=target_type, target_id=target_id)
        db.add(like)
        await db.commit()
        await bus.emit(
            "likes.added",
            {"userId": user_id, "targetType": target_type, "targetId": target_id},
        )
        liked = True
    else:
        await db.delete(row)
        await db.commit()
        await bus.emit(
            "likes.removed",
            {"userId": user_id, "targetType": target_type, "targetId": target_id},
        )
        liked = False

    return liked, await count_for_target(db, target_type=target_type, target_id=target_id)


async def remove(
    db: AsyncSession, *, user_id: str, target_type: str, target_id: str
) -> int:
    """Explicit unlike (no-op if already absent). Returns the new count."""
    existing = await db.execute(
        select(Like).where(
            Like.user_id == user_id,
            Like.target_type == target_type,
            Like.target_id == target_id,
        )
    )
    row = existing.scalar_one_or_none()
    if row is not None:
        await db.delete(row)
        await db.commit()
        await bus.emit(
            "likes.removed",
            {"userId": user_id, "targetType": target_type, "targetId": target_id},
        )
    return await count_for_target(db, target_type=target_type, target_id=target_id)


async def count_for_target(
    db: AsyncSession, *, target_type: str, target_id: str
) -> int:
    stmt = (
        select(func.count())
        .select_from(Like)
        .where(Like.target_type == target_type, Like.target_id == target_id)
    )
    return int((await db.execute(stmt)).scalar_one())


async def liked_by_me(
    db: AsyncSession, *, user_id: str, target_type: str, target_id: str
) -> bool:
    stmt = select(Like.id).where(
        Like.user_id == user_id,
        Like.target_type == target_type,
        Like.target_id == target_id,
    )
    return (await db.execute(stmt)).first() is not None


async def my_likes(
    db: AsyncSession, *, user_id: str, target_type: str | None = None
) -> list[Like]:
    stmt = (
        select(Like)
        .where(Like.user_id == user_id)
        .order_by(Like.created_at.desc())
    )
    if target_type:
        stmt = stmt.where(Like.target_type == target_type)
    return list((await db.execute(stmt)).scalars())
