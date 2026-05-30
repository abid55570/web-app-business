"""Order business logic for Django.

Mirrors the FastAPI orders/service.py — price → charge → snapshot → emit.
"""
from datetime import datetime, timezone
from decimal import Decimal

from events_bus.bus import emit
from menu.models import MenuItem
from payment_core.adapters import get_payment_adapter

from .models import Order


CANCELLABLE_STATUSES = {"pending", "confirmed", "preparing"}


class OrderError(Exception):
    """Service-layer error → mapped to JSON response by view."""

    def __init__(self, code: str, message: str, status_code: int = 400, **extra):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.extra = extra
        super().__init__(message)


def create_order(
    customer_id: str, items: list[dict], notes: str | None, tax_rate: Decimal = Decimal("0")
) -> Order:
    """Snapshot menu items, charge, persist, emit. Single transaction by
    default (Django's ATOMIC_REQUESTS or atomic block can wrap callers)."""
    item_ids = [i["itemId"] for i in items]
    menu = {str(m.pk): m for m in MenuItem.objects.filter(pk__in=item_ids)}

    snapshots: list[dict] = []
    subtotal = Decimal("0")
    currency = "USD"
    for line in items:
        item = menu.get(line["itemId"])
        if item is None:
            raise OrderError(
                "ORDER_ITEM_NOT_FOUND",
                "Menu item not found.",
                status_code=400,
                itemId=line["itemId"],
            )
        if not item.is_available:
            raise OrderError(
                "ORDER_ITEM_UNAVAILABLE",
                "Item is no longer available.",
                status_code=400,
                itemId=line["itemId"],
            )
        line_subtotal = item.price * line["qty"]
        snapshots.append({
            "itemId": str(item.pk),
            "name": item.name,
            "qty": line["qty"],
            "unitPrice": float(item.price),
            "currency": item.currency,
            "subtotal": float(line_subtotal),
        })
        subtotal += line_subtotal
        currency = item.currency

    tax = (subtotal * tax_rate).quantize(Decimal("0.01"))
    total = subtotal + tax

    adapter = get_payment_adapter()
    intent = adapter.create_intent(
        total, currency, metadata={"customerId": str(customer_id)}
    )
    if not adapter.capture(intent["intentId"]):
        raise OrderError(
            "ORDER_PAYMENT_FAILED", "Payment could not be processed.", status_code=402
        )

    order = Order.objects.create(
        customer_id=str(customer_id),
        items=snapshots,
        subtotal=subtotal,
        tax=tax,
        total=total,
        currency=currency,
        status="confirmed",
        payment_status="paid",
        payment_id=intent["intentId"],
        notes=notes,
    )

    emit(
        "order.placed",
        {
            "orderId": str(order.pk),
            "customerId": str(customer_id),
            "total": float(total),
            "items": snapshots,
        },
    )
    return order


def list_customer_orders(customer_id: str) -> list[Order]:
    return list(
        Order.objects.filter(customer_id=str(customer_id)).order_by("-created_at")
    )


def get_customer_order(order_id: str, customer_id: str) -> Order:
    """Returns 404 (not 403) for cross-customer reads — prevents enumeration."""
    try:
        return Order.objects.get(pk=order_id, customer_id=str(customer_id))
    except Order.DoesNotExist:
        raise OrderError("ORDER_NOT_FOUND", "Order not found.", status_code=404)


def list_all_orders(status: str | None = None) -> list[Order]:
    qs = Order.objects.all().order_by("-created_at")
    if status:
        qs = qs.filter(status=status)
    return list(qs)


def get_order_admin(order_id: str) -> Order:
    try:
        return Order.objects.get(pk=order_id)
    except Order.DoesNotExist:
        raise OrderError("ORDER_NOT_FOUND", "Order not found.", status_code=404)


def update_status(order_id: str, new_status: str) -> Order:
    o = get_order_admin(order_id)
    o.status = new_status
    o.updated_at = datetime.now(timezone.utc)
    o.save(update_fields=["status", "updated_at"])
    if new_status == "confirmed":
        emit("order.confirmed", {"orderId": str(o.pk)})
    return o


def cancel_order(order_id: str, by_customer: str | None = None) -> Order:
    o = (
        get_customer_order(order_id, by_customer)
        if by_customer is not None
        else get_order_admin(order_id)
    )
    if o.status not in CANCELLABLE_STATUSES:
        raise OrderError(
            "ORDER_NOT_CANCELLABLE",
            "Cannot cancel order in this status.",
            status_code=409,
            status=o.status,
        )

    refunded = False
    if o.payment_status == "paid" and o.payment_id:
        if get_payment_adapter().refund(o.payment_id):
            o.payment_status = "refunded"
            refunded = True

    o.status = "cancelled"
    o.updated_at = datetime.now(timezone.utc)
    o.save(update_fields=["status", "payment_status", "updated_at"])

    emit("order.cancelled", {"orderId": str(o.pk), "reason": None})
    if refunded:
        emit("order.refunded", {"orderId": str(o.pk), "amount": float(o.total)})
    return o
