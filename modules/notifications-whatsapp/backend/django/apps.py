"""Django AppConfig for notifications-whatsapp."""
from django.apps import AppConfig


class NotificationsWhatsappConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications_whatsapp"
    label = "notifications_whatsapp"
    verbose_name = "Notifications — WhatsApp"

    def ready(self) -> None:
        from .adapters import install_default

        install_default()
