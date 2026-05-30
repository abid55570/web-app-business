"""Pydantic schemas for payment-stripe-subs@v1."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


SubStatus = Literal[
    "trialing", "active", "past_due", "canceled", "incomplete"
]


class PlanBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    key: str = Field(min_length=1, max_length=64, pattern=r"^[a-z0-9][a-z0-9._-]*$")
    name: str = Field(min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    amount_cents: int = Field(alias="amountCents", ge=0)
    currency: str = Field(default="USD", min_length=3, max_length=3)
    interval: Literal["month", "year"] = "month"


class PlanCreate(PlanBase):
    pass


class PlanUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=2000)
    amount_cents: int | None = Field(default=None, alias="amountCents", ge=0)
    active: bool | None = None


class PlanResponse(PlanBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    stripe_price_id: str | None = Field(default=None, alias="stripePriceId")
    active: bool
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class PlanListResponse(BaseModel):
    items: list[PlanResponse]
    total: int


class CheckoutBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    plan_key: str = Field(alias="planKey", min_length=1)
    customer_ref: str = Field(alias="customerRef", min_length=1, max_length=36)
    success_url: str = Field(alias="successUrl")
    cancel_url: str = Field(alias="cancelUrl")


class CheckoutResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    checkout_url: str = Field(alias="checkoutUrl")
    session_id: str = Field(alias="sessionId")


class PortalBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    customer_ref: str = Field(alias="customerRef", min_length=1, max_length=36)
    return_url: str | None = Field(default=None, alias="returnUrl")


class PortalResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    portal_url: str = Field(alias="portalUrl")


class SubscriptionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    customer_ref: str = Field(alias="customerRef")
    plan_key: str = Field(alias="planKey")
    status: SubStatus
    stripe_subscription_id: str | None = Field(
        default=None, alias="stripeSubscriptionId"
    )
    trial_ends_at: datetime | None = Field(default=None, alias="trialEndsAt")
    current_period_start: datetime | None = Field(
        default=None, alias="currentPeriodStart"
    )
    current_period_end: datetime | None = Field(
        default=None, alias="currentPeriodEnd"
    )
    canceled_at: datetime | None = Field(default=None, alias="canceledAt")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class SubscriptionListResponse(BaseModel):
    items: list[SubscriptionResponse]
    total: int
