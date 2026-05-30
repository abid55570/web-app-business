"""Django AppConfig for payment-core."""
from django.apps import AppConfig


class PaymentCoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_core"
    label = "payment_core"
    verbose_name = "Payment (core)"
