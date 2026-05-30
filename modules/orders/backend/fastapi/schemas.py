"""Pydantic schemas mirroring orders@v1 contract.

IDs serialize as ``str`` (not UUID) to stay consistent with ``User.id``,
which is a 36-char string. Pydantic still validates the UUID shape on input
because callers pass UUIDs as JSON strings anyway.
"""
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field


OrderStatus = Literal[
    "pending", "confirmed", "preparing", "ready", "completed", "cancelled"
]
PaymentStatus = Literal["unpaid", "paid", "refunded", "failed"]


class OrderItemInput(BaseModel):
    itemId: str
    qty: int = Field(ge=1)


class OrderItemDetail(BaseModel):
    itemId: str
    name: str
    qty: int
    unitPrice: Decimal
    currency: str
    subtotal: Decimal


class OrderCreate(BaseModel):
    items: list[OrderItemInput] = Field(min_length=1)
    notes: str | None = None


class OrderStatusUpdate(BaseModel):
    status: OrderStatus


class OrderResponse(BaseModel):
    id: str
    customerId: str
    items: list[OrderItemDetail]
    subtotal: Decimal
    tax: Decimal
    discount: Decimal
    total: Decimal
    currency: str
    status: OrderStatus
    paymentStatus: PaymentStatus
    paymentId: str | None = None
    notes: str | None = None
    createdAt: datetime
    updatedAt: datetime

    @classmethod
    def from_model(cls, m) -> "OrderResponse":
        return cls(
            id=m.id,
            customerId=m.customer_id,
            items=[OrderItemDetail(**i) for i in m.items],
            subtotal=m.subtotal,
            tax=m.tax,
            discount=m.discount,
            total=m.total,
            currency=m.currency,
            status=m.status,
            paymentStatus=m.payment_status,
            paymentId=m.payment_id,
            notes=m.notes,
            createdAt=m.created_at,
            updatedAt=m.updated_at,
        )


class OrderListResponse(BaseModel):
    orders: list[OrderResponse]
    total: int
