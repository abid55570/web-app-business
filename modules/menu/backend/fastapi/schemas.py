"""Pydantic schemas for menu@v1 endpoints."""
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field


class MenuItemBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1, max_length=255)
    description: str | None = None
    price: Decimal = Field(ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2048)
    category: str = Field(min_length=1, max_length=64)
    is_available: bool = Field(default=True, alias="isAvailable")
    sort_order: int = Field(default=0, alias="sortOrder")


class MenuItemCreate(MenuItemBase):
    pass


class MenuItemUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None
    price: Decimal | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, min_length=3, max_length=3)
    image_url: str | None = Field(default=None, alias="imageUrl", max_length=2048)
    category: str | None = Field(default=None, min_length=1, max_length=64)
    is_available: bool | None = Field(default=None, alias="isAvailable")
    sort_order: int | None = Field(default=None, alias="sortOrder")


class AvailabilityToggle(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    is_available: bool = Field(alias="isAvailable")


class MenuItemResponse(MenuItemBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class MenuListResponse(BaseModel):
    items: list[MenuItemResponse]
    total: int


class CategoryListResponse(BaseModel):
    categories: list[str]
