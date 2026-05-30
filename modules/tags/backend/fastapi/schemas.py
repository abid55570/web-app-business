"""Pydantic schemas for tags@v1 endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TagBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slug: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9][a-z0-9-]*$")
    label: str = Field(min_length=1, max_length=128)
    description: str | None = Field(default=None, max_length=512)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{3,8}$")


class TagCreate(TagBase):
    pass


class TagUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    slug: str | None = Field(
        default=None, min_length=1, max_length=64, pattern=r"^[a-z0-9][a-z0-9-]*$"
    )
    label: str | None = Field(default=None, min_length=1, max_length=128)
    description: str | None = Field(default=None, max_length=512)
    color: str | None = Field(default=None, pattern=r"^#[0-9a-fA-F]{3,8}$")


class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class TagListResponse(BaseModel):
    items: list[TagResponse]
    total: int


# ----- assignments -----


class AssignBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    tag_id: str = Field(alias="tagId")
    target_type: str = Field(alias="targetType", min_length=1, max_length=64)
    target_id: str = Field(alias="targetId", min_length=1, max_length=255)


class TagsForTargetResponse(BaseModel):
    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    tags: list[TagResponse]

    model_config = ConfigDict(populate_by_name=True)


class TargetsForTagResponse(BaseModel):
    """For "find all things tagged with X". Returns target refs only — caller
    fetches the actual targets via the relevant module's API."""

    model_config = ConfigDict(populate_by_name=True)

    tag: TagResponse
    targets: list[dict[str, str]]  # [{ "targetType": "...", "targetId": "..." }]
