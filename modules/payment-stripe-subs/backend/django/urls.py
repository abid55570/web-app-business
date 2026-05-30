"""payment-stripe-subs URLs."""
from django.urls import path

from .views import (
    AdminPlanItemView,
    AdminPlansView,
    AdminSubsView,
    PublicActiveSubView,
    PublicCheckoutView,
    PublicPlansView,
    PublicPortalView,
    WebhookView,
)


app_name = "payment_stripe_subs"


urlpatterns = [
    path("plans", PublicPlansView.as_view(), name="public_plans"),
    path(
        "subscriptions/checkout",
        PublicCheckoutView.as_view(),
        name="public_checkout",
    ),
    path(
        "subscriptions/portal",
        PublicPortalView.as_view(),
        name="public_portal",
    ),
    path(
        "subscriptions/active/<str:customer_ref>",
        PublicActiveSubView.as_view(),
        name="public_active",
    ),
    path("admin/plans", AdminPlansView.as_view(), name="admin_plans"),
    path("admin/plans/<str:plan_id>", AdminPlanItemView.as_view(), name="admin_plan_item"),
    path("admin/subscriptions", AdminSubsView.as_view(), name="admin_subs"),
]
