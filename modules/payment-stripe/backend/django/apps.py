"""Django AppConfig for payment-stripe.

``ready()`` registers StripePaymentAdapter as the global. Loaded after
payment-fake's app, so when both ship the recipe gets Stripe live and
fake stays as the unused fallback ABC implementation.
"""
from django.apps import AppConfig


class PaymentStripeConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_stripe"
    label = "payment_stripe"
    verbose_name = "Payment — Stripe"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
