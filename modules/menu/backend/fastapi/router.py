"""FastAPI routes implementing menu@v1.

Two routers exported:
  - public_router  -> mounted at /api    (no auth required)
  - admin_router   -> mounted at /api/admin (auth required via CurrentUser)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin
from app.database import get_db
from app.menu.schemas import (
    AvailabilityToggle,
    CategoryListResponse,
    MenuItemCreate,
    MenuItemResponse,
    MenuItemUpdate,
    MenuListResponse,
)
from app.menu.service import (
    MenuError,
    create_item,
    delete_item,
    get_item,
    list_categories,
    list_items,
    set_availability,
    update_item,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get("/menu", response_model=MenuListResponse, response_model_by_alias=True)
async def list_menu_public(
    db: Annotated[AsyncSession, Depends(get_db)],
    category: Annotated[str | None, Query()] = None,
) -> MenuListResponse:
    items = await list_items(db, available_only=True, category=category)
    return MenuListResponse(
        items=[MenuItemResponse.model_validate(i) for i in items],
        total=len(items),
    )


@public_router.get(
    "/menu/categories",
    response_model=CategoryListResponse,
    response_model_by_alias=True,
)
async def list_categories_public(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> CategoryListResponse:
    return CategoryListResponse(categories=await list_categories(db))


@public_router.get(
    "/menu/{item_id}",
    response_model=MenuItemResponse,
    response_model_by_alias=True,
)
async def get_menu_item_public(
    item_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> MenuItemResponse:
    item = await get_item(db, item_id)
    if not item.is_available:
        raise MenuError("MENU_ITEM_NOT_FOUND", "Menu item not found.", status_code=404)
    return MenuItemResponse.model_validate(item)


# ---- ADMIN ----


@admin_router.get("/menu", response_model=MenuListResponse, response_model_by_alias=True)
async def list_menu_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    category: Annotated[str | None, Query()] = None,
) -> MenuListResponse:
    items = await list_items(db, available_only=False, category=category)
    return MenuListResponse(
        items=[MenuItemResponse.model_validate(i) for i in items],
        total=len(items),
    )


@admin_router.get(
    "/menu/{item_id}",
    response_model=MenuItemResponse,
    response_model_by_alias=True,
)
async def get_menu_item_admin(
    item_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> MenuItemResponse:
    return MenuItemResponse.model_validate(await get_item(db, item_id))


@admin_router.post(
    "/menu",
    response_model=MenuItemResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_menu_item(
    body: MenuItemCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> MenuItemResponse:
    return MenuItemResponse.model_validate(await create_item(db, body))


@admin_router.patch(
    "/menu/{item_id}",
    response_model=MenuItemResponse,
    response_model_by_alias=True,
)
async def update_menu_item(
    item_id: str,
    body: MenuItemUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> MenuItemResponse:
    return MenuItemResponse.model_validate(await update_item(db, item_id, body))


@admin_router.patch(
    "/menu/{item_id}/availability",
    response_model=MenuItemResponse,
    response_model_by_alias=True,
)
async def toggle_availability(
    item_id: str,
    body: AvailabilityToggle,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> MenuItemResponse:
    return MenuItemResponse.model_validate(
        await set_availability(db, item_id, body.is_available)
    )


@admin_router.delete("/menu/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_menu_item(
    item_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> None:
    await delete_item(db, item_id)
