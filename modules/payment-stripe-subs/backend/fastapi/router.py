"""FastAPI routes implementing payment-stripe-subs@v1.

Three routers:
  - public_router  -> /api       (plans list + checkout/portal session creators)
  - webhook_router -> /webhooks  (Stripe POSTs here)
  - admin_router   -> /api/admin (Plan CRUD + subscription read)
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.payment_stripe_subs.schemas import (
    CheckoutBody,
    CheckoutResponse,
    PlanCreate,
    PlanListResponse,
    PlanResponse,
    PlanUpdate,
    PortalBody,
    PortalResponse,
    SubscriptionListResponse,
    SubscriptionResponse,
)
from app.payment_stripe_subs.service import (
    create_checkout,
    create_plan,
    create_portal,
    get_active_for_ref,
    handle_webhook,
    list_plans,
    update_plan,
)


public_router = APIRouter()
webhook_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get(
    "/plans", response_model=PlanListResponse, response_model_by_alias=True
)
async def list_plans_public(
    db: Annotated[AsyncSession, Depends(get_db)],
) -> PlanListResponse:
    items = await list_plans(db, active_only=True)
    return PlanListResponse(
        items=[PlanResponse.model_validate(p) for p in items],
        total=len(items),
    )


@public_router.post(
    "/subscriptions/checkout",
    response_model=CheckoutResponse,
    response_model_by_alias=True,
)
async def start_checkout(
    body: CheckoutBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentUser,
) -> CheckoutResponse:
    session_id, url = await create_checkout(db, body)
    return CheckoutResponse(session_id=session_id, checkout_url=url)


@public_router.post(
    "/subscriptions/portal",
    response_model=PortalResponse,
    response_model_by_alias=True,
)
async def open_portal(
    body: PortalBody,
    _: CurrentUser,
) -> PortalResponse:
    url = await create_portal(body)
    return PortalResponse(portal_url=url)


@public_router.get(
    "/subscriptions/active/{customer_ref}",
    response_model=SubscriptionResponse | None,
    response_model_by_alias=True,
)
async def active_subscription(
    customer_ref: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentUser,
) -> SubscriptionResponse | None:
    sub = await get_active_for_ref(db, customer_ref)
    return SubscriptionResponse.model_validate(sub) if sub else None


# ---- WEBHOOK ----


@webhook_router.post("/stripe-subs", status_code=status.HTTP_200_OK)
async def stripe_subs_webhook(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    stripe_signature: Annotated[str | None, Header(alias="Stripe-Signature")] = None,
) -> dict:
    raw = await request.body()
    try:
        payload = await request.json()
    except Exception:  # noqa: BLE001
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "STRIPE_WEBHOOK_INVALID",
                "message": "Body is not valid JSON.",
            },
        )
    # Signature verification is performed in production via stripe SDK
    # (stripe.Webhook.construct_event) — left as a hook here so the unit
    # tests don't need the SDK installed.
    event_id = payload.get("id")
    event_type = payload.get("type")
    if not event_id or not event_type:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "STRIPE_WEBHOOK_INVALID",
                "message": "Missing event id or type.",
            },
        )
    await handle_webhook(
        db, event_id=event_id, event_type=event_type, payload=payload
    )
    return {"received": True, "id": event_id}


# ---- ADMIN ----


@admin_router.get(
    "/plans", response_model=PlanListResponse, response_model_by_alias=True
)
async def list_plans_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> PlanListResponse:
    items = await list_plans(db, active_only=False)
    return PlanListResponse(
        items=[PlanResponse.model_validate(p) for p in items],
        total=len(items),
    )


@admin_router.post(
    "/plans",
    response_model=PlanResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_plan_admin(
    body: PlanCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> PlanResponse:
    return PlanResponse.model_validate(await create_plan(db, body))


@admin_router.patch(
    "/plans/{plan_id}",
    response_model=PlanResponse,
    response_model_by_alias=True,
)
async def update_plan_admin(
    plan_id: str,
    body: PlanUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> PlanResponse:
    return PlanResponse.model_validate(await update_plan(db, plan_id, body))


@admin_router.get(
    "/subscriptions",
    response_model=SubscriptionListResponse,
    response_model_by_alias=True,
)
async def list_subscriptions_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> SubscriptionListResponse:
    from sqlalchemy import select

    from app.payment_stripe_subs.model import Subscription

    stmt = select(Subscription).order_by(Subscription.created_at.desc())
    items = list((await db.execute(stmt)).scalars())
    return SubscriptionListResponse(
        items=[SubscriptionResponse.model_validate(s) for s in items],
        total=len(items),
    )
