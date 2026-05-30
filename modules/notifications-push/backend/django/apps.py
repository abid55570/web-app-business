"""Django AppConfig for notifications-push."""
from django.apps import AppConfig


class NotificationsPushConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications_push"
    label = "notifications_push"
    verbose_name = "Web push notifications"
