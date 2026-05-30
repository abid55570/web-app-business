"""Django AppConfig for payment-banktransfer."""
from django.apps import AppConfig


class PaymentBankTransferConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_banktransfer"
    label = "payment_banktransfer"
    verbose_name = "Payment — Bank transfer"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
