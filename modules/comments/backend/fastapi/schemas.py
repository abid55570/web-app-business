"""Pydantic schemas for comments@v1 endpoints."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

CommentStatus = Literal["visible", "hidden", "flagged"]

MAX_BODY = 2000  # mirrors config_knob.max_body_length default


class CommentBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    body: str = Field(min_length=1, max_length=MAX_BODY)


class CommentCreate(CommentBase):
    """`authorId` resolved from the auth-context, not the body."""

    target_type: str = Field(alias="targetType", min_length=1, max_length=64)
    target_id: str = Field(alias="targetId", min_length=1, max_length=255)
    parent_id: str | None = Field(default=None, alias="parentId")


class CommentUpdate(BaseModel):
    """Author-only edit. Status changes are admin-only via StatusChange."""

    model_config = ConfigDict(populate_by_name=True)

    body: str = Field(min_length=1, max_length=MAX_BODY)


class StatusChange(BaseModel):
    """Admin moderation transition."""

    status: CommentStatus


class CommentResponse(CommentBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    author_id: str = Field(alias="authorId")
    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    parent_id: str | None = Field(default=None, alias="parentId")
    status: CommentStatus
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CommentListResponse(BaseModel):
    items: list[CommentResponse]
    total: int
