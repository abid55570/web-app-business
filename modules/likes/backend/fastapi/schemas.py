"""Pydantic schemas for likes@v1 endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class TargetRef(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType", min_length=1, max_length=64)
    target_id: str = Field(alias="targetId", min_length=1, max_length=255)


class LikeResponse(BaseModel):
    """The state of one (user, target) pair after a toggle."""

    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    liked: bool
    count: int


class LikeCountResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    count: int
    liked_by_me: bool = Field(alias="likedByMe")


class MyLike(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    target_type: str = Field(alias="targetType")
    target_id: str = Field(alias="targetId")
    created_at: datetime = Field(alias="createdAt")


class MyLikesResponse(BaseModel):
    items: list[MyLike]
    total: int
