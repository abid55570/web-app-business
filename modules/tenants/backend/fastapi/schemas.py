"""Pydantic schemas for tenants@v1."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


TenantRole = Literal["owner", "admin", "member"]


class TenantBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9][a-z0-9-]*$")


class TenantCreate(TenantBase):
    """`ownerId` resolved from auth context."""


class TenantUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(
        default=None, min_length=1, max_length=64, pattern=r"^[a-z0-9][a-z0-9-]*$"
    )
    plan: str | None = Field(default=None, max_length=32)


class TenantResponse(TenantBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    owner_id: str = Field(alias="ownerId")
    plan: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class TenantListResponse(BaseModel):
    items: list[TenantResponse]
    total: int


# ----- members -----


class InviteBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    user_id: str = Field(alias="userId", min_length=1, max_length=36)
    role: TenantRole = "member"


class RoleChange(BaseModel):
    role: TenantRole


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    tenant_id: str = Field(alias="tenantId")
    user_id: str = Field(alias="userId")
    role: TenantRole
    invited_by: str | None = Field(default=None, alias="invitedBy")
    joined_at: datetime = Field(alias="joinedAt")


class MemberListResponse(BaseModel):
    items: list[MemberResponse]
    total: int
