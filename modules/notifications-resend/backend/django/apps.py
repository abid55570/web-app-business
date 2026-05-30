"""Django AppConfig for notifications-resend.

``ready()`` overrides the default StubEmailAdapter (registered by
notifications' ready()) with ResendEmailAdapter for the "email" channel.
Loaded after notifications.NotificationsConfig.ready() so the override
sticks.
"""
from django.apps import AppConfig


class NotificationsResendConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications_resend"
    label = "notifications_resend"
    verbose_name = "Notifications — Resend"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
