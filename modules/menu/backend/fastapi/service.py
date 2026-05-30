"""Menu business logic."""
from sqlalchemy import distinct, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.menu.model import MenuItem
from app.menu.schemas import MenuItemCreate, MenuItemUpdate


class MenuError(AppError):
    """Raised by the menu service. Mapped to JSON by middleware."""


async def list_items(
    db: AsyncSession,
    *,
    available_only: bool = False,
    category: str | None = None,
) -> list[MenuItem]:
    stmt = select(MenuItem).order_by(MenuItem.category, MenuItem.sort_order, MenuItem.name)
    if available_only:
        stmt = stmt.where(MenuItem.is_available.is_(True))
    if category:
        stmt = stmt.where(MenuItem.category == category)
    result = await db.execute(stmt)
    return list(result.scalars())


async def get_item(db: AsyncSession, item_id: str) -> MenuItem:
    result = await db.execute(select(MenuItem).where(MenuItem.id == item_id))
    item = result.scalar_one_or_none()
    if item is None:
        raise MenuError("MENU_ITEM_NOT_FOUND", "Menu item not found.", status_code=404)
    return item


async def list_categories(db: AsyncSession) -> list[str]:
    result = await db.execute(
        select(distinct(MenuItem.category)).where(MenuItem.is_available.is_(True))
    )
    return sorted([row[0] for row in result.all()])


async def create_item(db: AsyncSession, body: MenuItemCreate) -> MenuItem:
    item = MenuItem(
        name=body.name,
        description=body.description,
        price=body.price,
        currency=body.currency,
        image_url=body.image_url,
        category=body.category,
        is_available=body.is_available,
        sort_order=body.sort_order,
    )
    db.add(item)
    await db.commit()
    await db.refresh(item)
    return item


async def update_item(db: AsyncSession, item_id: str, body: MenuItemUpdate) -> MenuItem:
    item = await get_item(db, item_id)
    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(item, key, value)
    await db.commit()
    await db.refresh(item)
    return item


async def set_availability(
    db: AsyncSession, item_id: str, is_available: bool
) -> MenuItem:
    item = await get_item(db, item_id)
    item.is_available = is_available
    await db.commit()
    await db.refresh(item)
    return item


async def delete_item(db: AsyncSession, item_id: str) -> None:
    item = await get_item(db, item_id)
    await db.delete(item)
    await db.commit()
