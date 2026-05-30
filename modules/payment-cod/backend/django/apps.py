"""Django AppConfig for payment-cod."""
from django.apps import AppConfig


class PaymentCodConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_cod"
    label = "payment_cod"
    verbose_name = "Payment — Cash on Delivery"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
