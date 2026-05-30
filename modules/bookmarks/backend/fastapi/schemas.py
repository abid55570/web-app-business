"""Pydantic schemas for bookmarks@v1 endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


MAX_NOTE = 1000  # mirrors config_knob default


class BookmarkSaveBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType", min_length=1, max_length=64)
    target_id: str = Field(alias="targetId", min_length=1, max_length=255)
    note: str | None = Field(default=None, max_length=MAX_NOTE)


class BookmarkResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    note: str | None
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class BookmarkListResponse(BaseModel):
    items: list[BookmarkResponse]
    total: int


class CheckResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    bookmarked: bool
