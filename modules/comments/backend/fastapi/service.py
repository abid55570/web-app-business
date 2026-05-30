"""comments business logic.

Self-edit + self-delete by author are allowed via the public router.
Moderation actions (hide/flag/restore) flow through the admin router.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.comments.model import Comment
from app.comments.schemas import CommentCreate, CommentStatus, CommentUpdate


class CommentError(AppError):
    """Raised by the comments service. Mapped to JSON by middleware."""


async def list_for_target(
    db: AsyncSession,
    *,
    target_type: str,
    target_id: str,
    include_hidden: bool = False,
) -> list[Comment]:
    stmt = (
        select(Comment)
        .where(Comment.target_type == target_type, Comment.target_id == target_id)
        .order_by(Comment.created_at.asc())
    )
    if not include_hidden:
        stmt = stmt.where(Comment.status == "visible")
    result = await db.execute(stmt)
    return list(result.scalars())


async def list_all(
    db: AsyncSession,
    *,
    status: str | None = None,
    target_type: str | None = None,
) -> list[Comment]:
    stmt = select(Comment).order_by(Comment.created_at.desc())
    if status:
        stmt = stmt.where(Comment.status == status)
    if target_type:
        stmt = stmt.where(Comment.target_type == target_type)
    result = await db.execute(stmt)
    return list(result.scalars())


async def get_comment(db: AsyncSession, comment_id: str) -> Comment:
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    c = result.scalar_one_or_none()
    if c is None:
        raise CommentError("COMMENT_NOT_FOUND", "Comment not found.", status_code=404)
    return c


async def create_comment(
    db: AsyncSession,
    *,
    author_id: str,
    body: CommentCreate,
    allow_nested: bool = True,
) -> Comment:
    if body.parent_id is not None:
        if not allow_nested:
            raise CommentError(
                "COMMENT_NESTING_DISABLED",
                "Nested replies are disabled.",
                status_code=400,
            )
        # Verify parent exists + scopes to same target
        parent = await get_comment(db, body.parent_id)
        if parent.target_type != body.target_type or parent.target_id != body.target_id:
            raise CommentError(
                "COMMENT_PARENT_MISMATCH",
                "Parent comment belongs to a different target.",
                status_code=400,
            )

    c = Comment(
        author_id=author_id,
        target_type=body.target_type,
        target_id=body.target_id,
        parent_id=body.parent_id,
        body=body.body,
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)

    await bus.emit(
        "comments.created",
        {
            "id": c.id,
            "targetType": c.target_type,
            "targetId": c.target_id,
            "authorId": c.author_id,
        },
    )
    return c


async def update_own(
    db: AsyncSession, *, comment_id: str, author_id: str, body: CommentUpdate
) -> Comment:
    c = await get_comment(db, comment_id)
    if c.author_id != author_id:
        raise CommentError(
            "AUTH_FORBIDDEN",
            "Only the comment author can edit this comment.",
            status_code=403,
        )
    c.body = body.body
    await db.commit()
    await db.refresh(c)
    await bus.emit("comments.updated", {"id": c.id})
    return c


async def delete_own(
    db: AsyncSession, *, comment_id: str, author_id: str
) -> None:
    c = await get_comment(db, comment_id)
    if c.author_id != author_id:
        raise CommentError(
            "AUTH_FORBIDDEN",
            "Only the comment author can delete this comment.",
            status_code=403,
        )
    await db.delete(c)
    await db.commit()
    await bus.emit("comments.deleted", {"id": comment_id})


async def change_status(
    db: AsyncSession, *, comment_id: str, new_status: CommentStatus
) -> Comment:
    c = await get_comment(db, comment_id)
    was_visible = c.status == "visible"
    c.status = new_status
    await db.commit()
    await db.refresh(c)

    if was_visible and new_status != "visible":
        await bus.emit("comments.hidden", {"id": c.id})
    await bus.emit("comments.updated", {"id": c.id})
    return c


async def admin_delete(db: AsyncSession, comment_id: str) -> None:
    c = await get_comment(db, comment_id)
    await db.delete(c)
    await db.commit()
    await bus.emit("comments.deleted", {"id": comment_id})
