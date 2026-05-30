"""payment-razorpay URLs."""
from django.urls import path

from .webhooks import RazorpayWebhookView


app_name = "payment_razorpay"


urlpatterns = [
    path("razorpay", RazorpayWebhookView.as_view(), name="webhook"),
]
