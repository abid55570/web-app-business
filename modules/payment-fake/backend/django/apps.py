"""Django AppConfig for payment-fake.

``ready()`` registers FakePaymentAdapter as the global so service code
that calls ``payment_core.adapters.get_payment_adapter()`` resolves to
this implementation. Real-gateway modules (payment-stripe, ...) ship
their own ready() and override depending on app load order.
"""
from django.apps import AppConfig


class PaymentFakeConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "payment_fake"
    label = "payment_fake"
    verbose_name = "Payment (fake)"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
