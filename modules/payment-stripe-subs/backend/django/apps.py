"""Django AppConfig for payment-stripe-subs."""
from django.apps import AppConfig


class PaymentStripeSubsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_stripe_subs"
    label = "payment_stripe_subs"
    verbose_name = "Stripe subscriptions"
