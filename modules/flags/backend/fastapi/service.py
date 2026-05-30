"""flags business logic — idempotent open + moderator resolve/dismiss."""
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.flags.model import Flag
from app.flags.schemas import ALLOWED_REASONS, FlagCreate


class FlagError(AppError):
    """Raised by the flags service."""


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def open_flag(
    db: AsyncSession, *, reporter_id: str, body: FlagCreate
) -> Flag:
    if body.reason not in ALLOWED_REASONS:
        raise FlagError(
            "FLAG_REASON_INVALID",
            f"reason must be one of {sorted(ALLOWED_REASONS)}",
            status_code=400,
        )

    existing = await db.execute(
        select(Flag).where(
            Flag.reporter_id == reporter_id,
            Flag.target_type == body.target_type,
            Flag.target_id == body.target_id,
        )
    )
    row = existing.scalar_one_or_none()
    if row is not None:
        # idempotent — same reporter+target = no new row, return existing
        return row

    f = Flag(
        reporter_id=reporter_id,
        target_type=body.target_type,
        target_id=body.target_id,
        reason=body.reason,
    )
    db.add(f)
    await db.commit()
    await db.refresh(f)
    await bus.emit(
        "flags.opened",
        {
            "id": f.id,
            "targetType": f.target_type,
            "targetId": f.target_id,
            "reporterId": f.reporter_id,
            "reason": f.reason,
        },
    )
    return f


async def get_flag(db: AsyncSession, flag_id: str) -> Flag:
    result = await db.execute(select(Flag).where(Flag.id == flag_id))
    row = result.scalar_one_or_none()
    if row is None:
        raise FlagError("FLAG_NOT_FOUND", "Flag not found.", status_code=404)
    return row


async def resolve(
    db: AsyncSession,
    *,
    flag_id: str,
    resolver_id: str,
    new_status: str,
    note: str | None,
) -> Flag:
    f = await get_flag(db, flag_id)
    f.status = new_status
    f.resolver_id = resolver_id
    f.resolver_note = note
    await db.commit()
    await db.refresh(f)
    event = "flags.resolved" if new_status == "resolved" else "flags.dismissed"
    await bus.emit(event, {"id": f.id, "resolverId": resolver_id})
    return f


async def list_for_admin(
    db: AsyncSession,
    *,
    status: str | None = None,
    target_type: str | None = None,
) -> list[Flag]:
    stmt = select(Flag).order_by(Flag.created_at.desc())
    if status:
        stmt = stmt.where(Flag.status == status)
    if target_type:
        stmt = stmt.where(Flag.target_type == target_type)
    return list((await db.execute(stmt)).scalars())


async def list_for_target_admin(
    db: AsyncSession, *, target_type: str, target_id: str
) -> list[Flag]:
    stmt = (
        select(Flag)
        .where(Flag.target_type == target_type, Flag.target_id == target_id)
        .order_by(Flag.created_at.desc())
    )
    return list((await db.execute(stmt)).scalars())
