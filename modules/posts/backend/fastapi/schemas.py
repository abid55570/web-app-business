"""Pydantic schemas for posts@v1 endpoints."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

PostStatus = Literal["draft", "published", "archived"]


class PostBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255, pattern=r"^[a-z0-9][a-z0-9-]*$")
    body: str = Field(min_length=1)
    excerpt: str | None = Field(default=None, max_length=512)
    cover_url: str | None = Field(default=None, alias="coverUrl", max_length=2048)
    status: PostStatus = "draft"


class PostCreate(PostBase):
    """`authorId` resolved from the auth-context, not the body."""


class PostUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(
        default=None, min_length=1, max_length=255, pattern=r"^[a-z0-9][a-z0-9-]*$"
    )
    body: str | None = Field(default=None, min_length=1)
    excerpt: str | None = Field(default=None, max_length=512)
    cover_url: str | None = Field(default=None, alias="coverUrl", max_length=2048)
    status: PostStatus | None = None


class StatusChange(BaseModel):
    """Dedicated body for /status — keeps publish/archive atomic + auditable."""

    status: PostStatus


class PostResponse(PostBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    author_id: str = Field(alias="authorId")
    published_at: datetime | None = Field(default=None, alias="publishedAt")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class PostListResponse(BaseModel):
    items: list[PostResponse]
    total: int
