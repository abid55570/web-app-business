"""Pydantic schemas for flags@v1."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

FlagStatus = Literal["open", "resolved", "dismissed"]
ALLOWED_REASONS = {"spam", "abuse", "off-topic", "illegal", "other"}


class FlagCreate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType", min_length=1, max_length=64)
    target_id: str = Field(alias="targetId", min_length=1, max_length=255)
    reason: str = Field(min_length=1, max_length=64)


class ResolveBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: Literal["resolved", "dismissed"]
    note: str | None = Field(default=None, max_length=1000, alias="resolverNote")


class FlagResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    reporter_id: str = Field(alias="reporterId")
    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    reason: str
    status: FlagStatus
    resolver_id: str | None = Field(default=None, alias="resolverId")
    resolver_note: str | None = Field(default=None, alias="resolverNote")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class FlagListResponse(BaseModel):
    items: list[FlagResponse]
    total: int
