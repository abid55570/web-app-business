"""payment-stripe-subs business logic.

Stripe interactions are wrapped behind `_create_stripe_*` helpers so the
test harness can monkey-patch them (we don't want network calls in CI).
In prod they call `stripe.checkout.Session.create` etc.

Webhook handler is INSERT-and-handle: try INSERT into `subs_webhook_events`;
if the primary key (= Stripe event.id) already exists, that's a duplicate
delivery — we early-return. Otherwise we update the matching Subscription
row + emit the bus event.
"""
from __future__ import annotations

import json
import os
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.payment_stripe_subs.model import Plan, Subscription, SubsWebhookEvent
from app.payment_stripe_subs.schemas import (
    CheckoutBody,
    PlanCreate,
    PlanUpdate,
    PortalBody,
)


class SubsError(AppError):
    """Raised by the subs service."""


DEFAULT_TRIAL_DAYS = 14


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


# ---- stripe wrappers (monkey-patched in tests) ----


def _stripe_create_price(plan: Plan) -> str:
    """Return a Stripe price id. Real impl calls stripe.Price.create."""
    # In tests this is replaced; default returns a fake id so the local
    # flow doesn't hard-require the stripe SDK to import-resolve.
    return f"price_local_{plan.key}"


def _stripe_create_checkout_session(
    plan: Plan, body: CheckoutBody
) -> tuple[str, str]:
    """Return (session_id, checkout_url). Real impl calls
    stripe.checkout.Session.create."""
    return (
        f"cs_local_{plan.key}_{body.customer_ref}",
        f"https://stripe.test/checkout/{plan.key}?ref={body.customer_ref}",
    )


def _stripe_create_portal_session(
    customer_ref: str, return_url: str
) -> str:
    """Return billing portal url. Real impl calls
    stripe.billing_portal.Session.create."""
    return f"https://stripe.test/portal/{customer_ref}?return_to={return_url}"


# ---- plans ----


async def list_plans(db: AsyncSession, *, active_only: bool = True) -> list[Plan]:
    stmt = select(Plan).order_by(Plan.amount_cents.asc())
    if active_only:
        stmt = stmt.where(Plan.active.is_(True))
    return list((await db.execute(stmt)).scalars())


async def get_plan_by_key(db: AsyncSession, key: str) -> Plan:
    plan = (
        await db.execute(select(Plan).where(Plan.key == key))
    ).scalar_one_or_none()
    if plan is None:
        raise SubsError("PLAN_NOT_FOUND", "Plan not found.", status_code=404)
    return plan


async def create_plan(db: AsyncSession, body: PlanCreate) -> Plan:
    existing = await db.execute(select(Plan).where(Plan.key == body.key))
    if existing.scalar_one_or_none() is not None:
        raise SubsError(
            "PLAN_KEY_TAKEN",
            f"Plan key '{body.key}' is already in use.",
            status_code=409,
        )
    plan = Plan(
        key=body.key,
        name=body.name,
        description=body.description,
        amount_cents=body.amount_cents,
        currency=body.currency,
        interval=body.interval,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    plan.stripe_price_id = _stripe_create_price(plan)
    await db.commit()
    await db.refresh(plan)
    return plan


async def update_plan(
    db: AsyncSession, plan_id: str, body: PlanUpdate
) -> Plan:
    plan = (
        await db.execute(select(Plan).where(Plan.id == plan_id))
    ).scalar_one_or_none()
    if plan is None:
        raise SubsError("PLAN_NOT_FOUND", "Plan not found.", status_code=404)
    data = body.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(plan, key, value)
    await db.commit()
    await db.refresh(plan)
    return plan


# ---- subscriptions ----


async def get_active_for_ref(
    db: AsyncSession, customer_ref: str
) -> Subscription | None:
    stmt = (
        select(Subscription)
        .where(Subscription.customer_ref == customer_ref)
        .order_by(Subscription.created_at.desc())
    )
    rows = list((await db.execute(stmt)).scalars())
    for row in rows:
        if row.status != "canceled":
            return row
    return None


async def create_checkout(
    db: AsyncSession, body: CheckoutBody
) -> tuple[str, str]:
    plan = await get_plan_by_key(db, body.plan_key)
    return _stripe_create_checkout_session(plan, body)


async def create_portal(body: PortalBody) -> str:
    return_url = body.return_url or os.getenv(
        "STRIPE_PORTAL_RETURN_URL", "https://example.com/billing"
    )
    return _stripe_create_portal_session(body.customer_ref, return_url)


# ---- webhook ----


async def handle_webhook(
    db: AsyncSession, *, event_id: str, event_type: str, payload: dict
) -> bool:
    """Returns True if the event was processed (or already had been)."""
    try:
        db.add(
            SubsWebhookEvent(
                id=event_id, type=event_type, payload=json.dumps(payload)
            )
        )
        await db.commit()
    except IntegrityError:
        await db.rollback()
        return True  # already handled; idempotent

    data = payload.get("data", {}).get("object", {})
    if event_type == "customer.subscription.created":
        await _upsert_subscription(db, data)
        sub = await _sub_from_stripe(db, data["id"])
        if sub:
            await bus.emit(
                "subscription.created",
                {
                    "id": sub.id,
                    "customerRef": sub.customer_ref,
                    "planKey": sub.plan_key,
                    "status": sub.status,
                },
            )
    elif event_type == "customer.subscription.updated":
        await _upsert_subscription(db, data)
        sub = await _sub_from_stripe(db, data["id"])
        if sub:
            await bus.emit(
                "subscription.updated", {"id": sub.id, "status": sub.status}
            )
    elif event_type == "customer.subscription.deleted":
        sub = await _sub_from_stripe(db, data["id"])
        if sub:
            sub.status = "canceled"
            sub.canceled_at = _utcnow()
            await db.commit()
            await bus.emit(
                "subscription.canceled",
                {"id": sub.id, "customerRef": sub.customer_ref},
            )
    elif event_type == "invoice.paid":
        await bus.emit(
            "subscription.invoice.paid",
            {
                "id": data.get("subscription"),
                "amountCents": data.get("amount_paid", 0),
            },
        )
    elif event_type == "invoice.payment_failed":
        await bus.emit(
            "subscription.invoice.failed",
            {
                "id": data.get("subscription"),
                "reason": data.get("last_finalization_error", {}).get(
                    "message", "unknown"
                ),
            },
        )

    return True


async def _sub_from_stripe(
    db: AsyncSession, stripe_id: str
) -> Subscription | None:
    return (
        await db.execute(
            select(Subscription).where(
                Subscription.stripe_subscription_id == stripe_id
            )
        )
    ).scalar_one_or_none()


async def _upsert_subscription(db: AsyncSession, stripe_obj: dict) -> None:
    stripe_id = stripe_obj["id"]
    sub = await _sub_from_stripe(db, stripe_id)
    metadata = stripe_obj.get("metadata", {}) or {}
    plan_key = metadata.get("plan_key") or stripe_obj.get("items", {}).get(
        "data", [{}]
    )[0].get("price", {}).get("nickname") or "unknown"
    customer_ref = metadata.get("customer_ref") or stripe_obj.get("customer", "")
    status = stripe_obj.get("status", "incomplete")
    if sub is None:
        sub = Subscription(
            customer_ref=customer_ref,
            plan_key=plan_key,
            status=status,
            stripe_subscription_id=stripe_id,
            stripe_customer_id=stripe_obj.get("customer"),
        )
        db.add(sub)
    sub.status = status
    if (cps := stripe_obj.get("current_period_start")) is not None:
        sub.current_period_start = datetime.fromtimestamp(cps, tz=timezone.utc)
    if (cpe := stripe_obj.get("current_period_end")) is not None:
        sub.current_period_end = datetime.fromtimestamp(cpe, tz=timezone.utc)
    if (te := stripe_obj.get("trial_end")) is not None:
        sub.trial_ends_at = datetime.fromtimestamp(te, tz=timezone.utc)
    await db.commit()
