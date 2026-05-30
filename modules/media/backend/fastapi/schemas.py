"""Pydantic schemas for media@v1."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

MediaKind = Literal["image", "video", "file"]
MAX_SIZE_BYTES = 26_214_400  # 25 MiB; mirrors config_knob default


class MediaRegisterBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    kind: MediaKind = "image"
    original_name: str | None = Field(
        default=None, alias="originalName", max_length=512
    )
    mime_type: str = Field(alias="mimeType", min_length=1, max_length=128)
    size_bytes: int = Field(alias="sizeBytes", ge=0, le=MAX_SIZE_BYTES)
    url: str = Field(min_length=1, max_length=2048)
    thumb_url: str | None = Field(default=None, alias="thumbUrl", max_length=2048)
    width: int | None = Field(default=None, ge=0)
    height: int | None = Field(default=None, ge=0)
    alt_text: str | None = Field(default=None, alias="altText", max_length=512)


class MediaUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    alt_text: str | None = Field(default=None, alias="altText", max_length=512)
    thumb_url: str | None = Field(default=None, alias="thumbUrl", max_length=2048)


class MediaResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    owner_id: str = Field(alias="ownerId")
    kind: MediaKind
    original_name: str | None = Field(default=None, alias="originalName")
    mime_type: str = Field(alias="mimeType")
    size_bytes: int = Field(alias="sizeBytes")
    url: str
    thumb_url: str | None = Field(default=None, alias="thumbUrl")
    width: int | None
    height: int | None
    alt_text: str | None = Field(default=None, alias="altText")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class MediaListResponse(BaseModel):
    items: list[MediaResponse]
    total: int
