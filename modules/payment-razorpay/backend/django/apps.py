"""Django AppConfig for payment-razorpay."""
from django.apps import AppConfig


class PaymentRazorpayConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_razorpay"
    label = "payment_razorpay"
    verbose_name = "Payment — Razorpay"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
