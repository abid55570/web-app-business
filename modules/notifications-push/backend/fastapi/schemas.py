"""Pydantic schemas for notifications-push@v1."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubscribeBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    endpoint: str = Field(min_length=1)
    p256dh_key: str = Field(alias="p256dhKey", min_length=1, max_length=255)
    auth_key: str = Field(alias="authKey", min_length=1, max_length=255)


class SendBody(BaseModel):
    """Admin-side fan-out: deliver `payload` to every subscription the
    target user has registered."""

    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId", min_length=1)
    payload: dict


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    user_id: str = Field(alias="userId")
    endpoint: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class SubscriptionListResponse(BaseModel):
    items: list[SubscriptionResponse]
    total: int


class SendResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId")
    delivered_count: int = Field(alias="deliveredCount")
    expired_count: int = Field(alias="expiredCount")


class VapidPublicKey(BaseModel):
    public_key: str = Field(alias="publicKey")

    model_config = ConfigDict(populate_by_name=True)
