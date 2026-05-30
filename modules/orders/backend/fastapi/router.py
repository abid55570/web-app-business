"""Orders dual routers — public_router (customer) + admin_router."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import get_current_admin, get_current_user
from app.auth_core.model import User
from app.database import get_db
from app.orders import service
from app.orders.schemas import (
    OrderCreate,
    OrderListResponse,
    OrderResponse,
    OrderStatusUpdate,
)


public_router = APIRouter()
admin_router = APIRouter()


@public_router.post("/orders", response_model=OrderResponse, status_code=201)
async def create_order(
    payload: OrderCreate,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    o = await service.create_order(db, user.id, payload)
    return OrderResponse.from_model(o)


@public_router.get("/orders", response_model=OrderListResponse)
async def list_my_orders(
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    rows = await service.list_customer_orders(db, user.id)
    return OrderListResponse(
        orders=[OrderResponse.from_model(r) for r in rows], total=len(rows)
    )


@public_router.get("/orders/{order_id}", response_model=OrderResponse)
async def get_my_order(
    order_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    o = await service.get_customer_order(db, order_id, user.id)
    return OrderResponse.from_model(o)


@public_router.post("/orders/{order_id}/cancel", response_model=OrderResponse)
async def cancel_my_order(
    order_id: str,
    user: Annotated[User, Depends(get_current_user)],
    db: Annotated[AsyncSession, Depends(get_db)],
):
    o = await service.cancel_order(db, order_id, by_customer=user.id)
    return OrderResponse.from_model(o)


@admin_router.get("/orders", response_model=OrderListResponse)
async def admin_list_orders(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
    status: Annotated[str | None, Query()] = None,
):
    rows = await service.list_all_orders(db, status=status)
    return OrderListResponse(
        orders=[OrderResponse.from_model(r) for r in rows], total=len(rows)
    )


@admin_router.get("/orders/{order_id}", response_model=OrderResponse)
async def admin_get_order(
    order_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    o = await service.get_order_admin(db, order_id)
    return OrderResponse.from_model(o)


@admin_router.patch("/orders/{order_id}", response_model=OrderResponse)
async def admin_update_order(
    order_id: str,
    payload: OrderStatusUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    o = await service.update_status(db, order_id, payload.status)
    return OrderResponse.from_model(o)


@admin_router.post("/orders/{order_id}/cancel", response_model=OrderResponse)
async def admin_cancel_order(
    order_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_admin)],
):
    o = await service.cancel_order(db, order_id)
    return OrderResponse.from_model(o)
