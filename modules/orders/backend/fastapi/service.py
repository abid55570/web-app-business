"""Order business logic — pricing, payment, status transitions, refunds.

All event emits forwarded through the in-process bus with the caller's
db session so subscribers write in the same transaction (PLAN §13).
"""
from datetime import datetime, timezone
from decimal import Decimal

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events_bus.bus import emit
from app.menu.model import MenuItem
from app.orders.model import Order
from app.orders.schemas import OrderCreate
from app.payment_core.adapters import get_payment_adapter


CANCELLABLE_STATUSES = {"pending", "confirmed", "preparing"}


async def create_order(
    db: AsyncSession,
    customer_id: str,
    payload: OrderCreate,
    tax_rate: Decimal = Decimal("0"),
) -> Order:
    """Price → charge → snapshot → emit. All in one transaction."""
    item_ids = [i.itemId for i in payload.items]
    res = await db.execute(select(MenuItem).where(MenuItem.id.in_(item_ids)))
    menu = {m.id: m for m in res.scalars().all()}

    snapshots: list[dict] = []
    subtotal = Decimal("0")
    currency = "USD"
    for line in payload.items:
        item = menu.get(line.itemId)
        if item is None:
            raise HTTPException(
                400, {"code": "ORDER_ITEM_NOT_FOUND", "itemId": str(line.itemId)}
            )
        if not item.is_available:
            raise HTTPException(
                400, {"code": "ORDER_ITEM_UNAVAILABLE", "itemId": str(line.itemId)}
            )
        line_subtotal = item.price * line.qty
        snapshots.append({
            "itemId": str(item.id),
            "name": item.name,
            "qty": line.qty,
            "unitPrice": float(item.price),
            "currency": item.currency,
            "subtotal": float(line_subtotal),
        })
        subtotal += line_subtotal
        currency = item.currency

    tax = (subtotal * tax_rate).quantize(Decimal("0.01"))
    total = subtotal + tax

    adapter = get_payment_adapter()
    intent = await adapter.create_intent(
        total, currency, metadata={"customerId": str(customer_id)}
    )
    captured = await adapter.capture(intent["intentId"])
    if not captured:
        raise HTTPException(402, {"code": "ORDER_PAYMENT_FAILED"})

    order = Order(
        customer_id=customer_id,
        items=snapshots,
        subtotal=subtotal,
        tax=tax,
        total=total,
        currency=currency,
        status="confirmed",
        payment_status="paid",
        payment_id=intent["intentId"],
        notes=payload.notes,
    )
    db.add(order)
    await db.flush()

    await emit(
        "order.placed",
        {
            "orderId": str(order.id),
            "customerId": str(customer_id),
            "total": float(total),
            "items": snapshots,
        },
        db,
    )
    return order


async def list_customer_orders(db: AsyncSession, customer_id: str) -> list[Order]:
    res = await db.execute(
        select(Order)
        .where(Order.customer_id == customer_id)
        .order_by(Order.created_at.desc())
    )
    return list(res.scalars().all())


async def get_customer_order(
    db: AsyncSession, order_id: str, customer_id: str
) -> Order:
    """Returns 404 (not 403) for cross-customer reads — prevents enumeration."""
    res = await db.execute(
        select(Order).where(Order.id == order_id, Order.customer_id == customer_id)
    )
    o = res.scalar_one_or_none()
    if o is None:
        raise HTTPException(404, {"code": "ORDER_NOT_FOUND"})
    return o


async def list_all_orders(db: AsyncSession, status: str | None = None) -> list[Order]:
    stmt = select(Order).order_by(Order.created_at.desc())
    if status:
        stmt = stmt.where(Order.status == status)
    res = await db.execute(stmt)
    return list(res.scalars().all())


async def get_order_admin(db: AsyncSession, order_id: str) -> Order:
    res = await db.execute(select(Order).where(Order.id == order_id))
    o = res.scalar_one_or_none()
    if o is None:
        raise HTTPException(404, {"code": "ORDER_NOT_FOUND"})
    return o


async def update_status(db: AsyncSession, order_id: str, new_status: str) -> Order:
    o = await get_order_admin(db, order_id)
    o.status = new_status
    o.updated_at = datetime.now(timezone.utc)
    await db.flush()
    if new_status == "confirmed":
        await emit("order.confirmed", {"orderId": str(o.id)}, db)
    return o


async def cancel_order(
    db: AsyncSession, order_id: str, by_customer: str | None = None
) -> Order:
    o = (
        await get_customer_order(db, order_id, by_customer)
        if by_customer is not None
        else await get_order_admin(db, order_id)
    )
    if o.status not in CANCELLABLE_STATUSES:
        raise HTTPException(
            409, {"code": "ORDER_NOT_CANCELLABLE", "status": o.status}
        )

    refunded = False
    if o.payment_status == "paid" and o.payment_id:
        adapter = get_payment_adapter()
        refunded = await adapter.refund(o.payment_id)
        if refunded:
            o.payment_status = "refunded"

    o.status = "cancelled"
    o.updated_at = datetime.now(timezone.utc)
    await db.flush()

    await emit("order.cancelled", {"orderId": str(o.id), "reason": None}, db)
    if refunded:
        await emit(
            "order.refunded",
            {"orderId": str(o.id), "amount": float(o.total)},
            db,
        )
    return o
