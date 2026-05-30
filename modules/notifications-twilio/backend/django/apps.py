"""Django AppConfig for notifications-twilio."""
from django.apps import AppConfig


class NotificationsTwilioConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications_twilio"
    label = "notifications_twilio"
    verbose_name = "Notifications — Twilio"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
