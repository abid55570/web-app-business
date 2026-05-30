"""posts business logic.

Status transitions are encoded here so the router stays thin. `publish()`
stamps `published_at` once on first transition to published; later edits
do not reset that timestamp.
"""
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.posts.model import Post
from app.posts.schemas import PostCreate, PostUpdate, PostStatus


class PostError(AppError):
    """Raised by the posts service. Mapped to JSON by middleware."""


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def list_posts(
    db: AsyncSession,
    *,
    published_only: bool = False,
    author_id: str | None = None,
    status: str | None = None,
) -> list[Post]:
    stmt = select(Post).order_by(Post.published_at.desc().nullslast(), Post.created_at.desc())
    if published_only:
        stmt = stmt.where(Post.status == "published")
    if author_id:
        stmt = stmt.where(Post.author_id == author_id)
    if status:
        stmt = stmt.where(Post.status == status)
    result = await db.execute(stmt)
    return list(result.scalars())


async def get_post(db: AsyncSession, post_id: str) -> Post:
    result = await db.execute(select(Post).where(Post.id == post_id))
    post = result.scalar_one_or_none()
    if post is None:
        raise PostError("POST_NOT_FOUND", "Post not found.", status_code=404)
    return post


async def get_post_by_slug(db: AsyncSession, slug: str) -> Post:
    result = await db.execute(select(Post).where(Post.slug == slug))
    post = result.scalar_one_or_none()
    if post is None:
        raise PostError("POST_NOT_FOUND", "Post not found.", status_code=404)
    return post


async def create_post(db: AsyncSession, author_id: str, body: PostCreate) -> Post:
    # slug uniqueness checked at DB; surface a friendly error if it collides
    existing = await db.execute(select(Post).where(Post.slug == body.slug))
    if existing.scalar_one_or_none() is not None:
        raise PostError("POST_SLUG_TAKEN", f"Slug '{body.slug}' is already in use.", status_code=409)

    published_at = _utcnow() if body.status == "published" else None
    post = Post(
        author_id=author_id,
        title=body.title,
        slug=body.slug,
        body=body.body,
        excerpt=body.excerpt,
        cover_url=body.cover_url,
        status=body.status,
        published_at=published_at,
    )
    db.add(post)
    await db.commit()
    await db.refresh(post)

    await bus.emit("posts.created", {"id": post.id, "authorId": post.author_id, "slug": post.slug})
    if post.status == "published":
        await bus.emit("posts.published", {"id": post.id, "slug": post.slug})
    return post


async def update_post(db: AsyncSession, post_id: str, body: PostUpdate) -> Post:
    post = await get_post(db, post_id)
    update_data = body.model_dump(exclude_unset=True)

    # Slug change → enforce uniqueness
    if "slug" in update_data and update_data["slug"] != post.slug:
        existing = await db.execute(
            select(Post).where(Post.slug == update_data["slug"], Post.id != post_id)
        )
        if existing.scalar_one_or_none() is not None:
            raise PostError(
                "POST_SLUG_TAKEN",
                f"Slug '{update_data['slug']}' is already in use.",
                status_code=409,
            )

    was_published = post.status == "published"
    for key, value in update_data.items():
        setattr(post, key, value)
    # First-publish stamps published_at
    if not was_published and post.status == "published" and post.published_at is None:
        post.published_at = _utcnow()

    await db.commit()
    await db.refresh(post)

    await bus.emit("posts.updated", {"id": post.id, "slug": post.slug})
    if not was_published and post.status == "published":
        await bus.emit("posts.published", {"id": post.id, "slug": post.slug})
    return post


async def change_status(db: AsyncSession, post_id: str, new_status: PostStatus) -> Post:
    post = await get_post(db, post_id)
    was_published = post.status == "published"
    post.status = new_status
    if not was_published and new_status == "published" and post.published_at is None:
        post.published_at = _utcnow()
    await db.commit()
    await db.refresh(post)

    await bus.emit("posts.updated", {"id": post.id, "slug": post.slug})
    if not was_published and new_status == "published":
        await bus.emit("posts.published", {"id": post.id, "slug": post.slug})
    return post


async def delete_post(db: AsyncSession, post_id: str) -> None:
    post = await get_post(db, post_id)
    await db.delete(post)
    await db.commit()
    await bus.emit("posts.deleted", {"id": post_id})
