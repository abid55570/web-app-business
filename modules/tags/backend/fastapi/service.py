"""tags business logic.

CRUD on the Tag entity + polymorphic assignment helpers. Assignment
helpers enforce the per-target cap and refuse duplicate (tag, target)
pairs (DB unique constraint backs it up).
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.tags.model import Tag, TagAssignment
from app.tags.schemas import TagCreate, TagUpdate


class TagError(AppError):
    """Raised by the tags service. Mapped to JSON by middleware."""


MAX_TAGS_PER_TARGET = 16  # mirrors config_knob default


# ---- tags ----


async def list_tags(db: AsyncSession) -> list[Tag]:
    result = await db.execute(select(Tag).order_by(Tag.slug))
    return list(result.scalars())


async def get_tag(db: AsyncSession, tag_id: str) -> Tag:
    result = await db.execute(select(Tag).where(Tag.id == tag_id))
    t = result.scalar_one_or_none()
    if t is None:
        raise TagError("TAG_NOT_FOUND", "Tag not found.", status_code=404)
    return t


async def get_tag_by_slug(db: AsyncSession, slug: str) -> Tag:
    result = await db.execute(select(Tag).where(Tag.slug == slug))
    t = result.scalar_one_or_none()
    if t is None:
        raise TagError("TAG_NOT_FOUND", "Tag not found.", status_code=404)
    return t


async def create_tag(db: AsyncSession, body: TagCreate) -> Tag:
    existing = await db.execute(select(Tag).where(Tag.slug == body.slug))
    if existing.scalar_one_or_none() is not None:
        raise TagError(
            "TAG_SLUG_TAKEN",
            f"Slug '{body.slug}' is already in use.",
            status_code=409,
        )
    t = Tag(slug=body.slug, label=body.label, description=body.description, color=body.color)
    db.add(t)
    await db.commit()
    await db.refresh(t)
    await bus.emit("tags.created", {"id": t.id, "slug": t.slug})
    return t


async def update_tag(db: AsyncSession, tag_id: str, body: TagUpdate) -> Tag:
    t = await get_tag(db, tag_id)
    update_data = body.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"] != t.slug:
        existing = await db.execute(
            select(Tag).where(Tag.slug == update_data["slug"], Tag.id != tag_id)
        )
        if existing.scalar_one_or_none() is not None:
            raise TagError(
                "TAG_SLUG_TAKEN",
                f"Slug '{update_data['slug']}' is already in use.",
                status_code=409,
            )
    for key, value in update_data.items():
        setattr(t, key, value)
    await db.commit()
    await db.refresh(t)
    await bus.emit("tags.updated", {"id": t.id})
    return t


async def delete_tag(db: AsyncSession, tag_id: str) -> None:
    t = await get_tag(db, tag_id)
    # Wipe assignments first to keep the DB clean
    await db.execute(
        TagAssignment.__table__.delete().where(TagAssignment.tag_id == t.id)
    )
    await db.delete(t)
    await db.commit()
    await bus.emit("tags.deleted", {"id": tag_id})


# ---- assignments ----


async def assign(
    db: AsyncSession, *, tag_id: str, target_type: str, target_id: str
) -> TagAssignment:
    # Tag must exist
    await get_tag(db, tag_id)

    # Cap check
    count_stmt = (
        select(TagAssignment)
        .where(
            TagAssignment.target_type == target_type,
            TagAssignment.target_id == target_id,
        )
    )
    existing = list((await db.execute(count_stmt)).scalars())
    if any(a.tag_id == tag_id for a in existing):
        # Idempotent: assigning the same tag twice is a no-op
        return next(a for a in existing if a.tag_id == tag_id)
    if len(existing) >= MAX_TAGS_PER_TARGET:
        raise TagError(
            "TAG_LIMIT_REACHED",
            f"Target already carries {MAX_TAGS_PER_TARGET} tags.",
            status_code=409,
        )

    a = TagAssignment(tag_id=tag_id, target_type=target_type, target_id=target_id)
    db.add(a)
    await db.commit()
    await db.refresh(a)
    await bus.emit(
        "tags.assigned",
        {"tagId": tag_id, "targetType": target_type, "targetId": target_id},
    )
    return a


async def unassign(
    db: AsyncSession, *, tag_id: str, target_type: str, target_id: str
) -> None:
    stmt = select(TagAssignment).where(
        TagAssignment.tag_id == tag_id,
        TagAssignment.target_type == target_type,
        TagAssignment.target_id == target_id,
    )
    result = await db.execute(stmt)
    a = result.scalar_one_or_none()
    if a is None:
        # idempotent
        return
    await db.delete(a)
    await db.commit()
    await bus.emit(
        "tags.unassigned",
        {"tagId": tag_id, "targetType": target_type, "targetId": target_id},
    )


async def tags_for_target(
    db: AsyncSession, *, target_type: str, target_id: str
) -> list[Tag]:
    """Returns the Tag rows attached to a single target."""
    sub = (
        select(TagAssignment.tag_id)
        .where(
            TagAssignment.target_type == target_type,
            TagAssignment.target_id == target_id,
        )
        .subquery()
    )
    result = await db.execute(
        select(Tag).where(Tag.id.in_(select(sub))).order_by(Tag.slug)
    )
    return list(result.scalars())


async def targets_for_tag(
    db: AsyncSession, *, tag_id: str, target_type: str | None = None
) -> list[dict[str, str]]:
    """Returns [{ targetType, targetId }, …] for everything carrying `tag_id`."""
    stmt = (
        select(TagAssignment.target_type, TagAssignment.target_id)
        .where(TagAssignment.tag_id == tag_id)
        .order_by(TagAssignment.created_at.desc())
    )
    if target_type:
        stmt = stmt.where(TagAssignment.target_type == target_type)
    rows = (await db.execute(stmt)).all()
    return [{"targetType": r[0], "targetId": r[1]} for r in rows]
