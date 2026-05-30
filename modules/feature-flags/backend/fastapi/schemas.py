"""Pydantic schemas for feature-flags@v1."""
import json
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class FlagBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    key: str = Field(min_length=1, max_length=128, pattern=r"^[a-z0-9][a-z0-9._-]*$")
    description: str | None = Field(default=None, max_length=512)
    enabled: bool = False
    rollout_percent: int = Field(default=0, alias="rolloutPercent", ge=0, le=100)
    audiences: list[str] = Field(default_factory=list)


class FlagCreate(FlagBase):
    pass


class FlagUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    description: str | None = Field(default=None, max_length=512)
    enabled: bool | None = None
    rollout_percent: int | None = Field(
        default=None, alias="rolloutPercent", ge=0, le=100
    )
    audiences: list[str] | None = None


class FlagResponse(FlagBase):
    model_config = ConfigDict(from_attributes=False, populate_by_name=True)

    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    @field_validator("audiences", mode="before")
    @classmethod
    def _decode_audiences(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v) if v else []
            except json.JSONDecodeError:
                return []
        return v or []

    @classmethod
    def from_model(cls, flag) -> "FlagResponse":
        return cls(
            id=flag.id,
            key=flag.key,
            description=flag.description,
            enabled=flag.enabled,
            rollout_percent=flag.rollout_percent,
            audiences=flag.audiences,
            created_at=flag.created_at,
            updated_at=flag.updated_at,
        )


class FlagListResponse(BaseModel):
    items: list[FlagResponse]
    total: int


class CheckResponse(BaseModel):
    key: str
    enabled: bool
    audience: str | None = None


class PublicFlag(BaseModel):
    key: str
    enabled: bool


class PublicListResponse(BaseModel):
    items: list[PublicFlag]
    total: int
