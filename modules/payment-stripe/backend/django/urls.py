"""payment-stripe URLs — webhook surface only, mounted at /api/webhooks/."""
from django.urls import path

from .webhooks import StripeWebhookView


app_name = "payment_stripe"


urlpatterns = [
    path("stripe", StripeWebhookView.as_view(), name="webhook"),
]
