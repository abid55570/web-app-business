"""Django AppConfig for notifications.

``ready()`` wires the bus subscriptions so emit("order.placed", ...) on
events-bus auto-dispatches a notification. Django's app registry guarantees
``ready()`` runs once per process after all models are loaded — equivalent
to the FastAPI wirer's ``register_subscriptions()`` lifespan hook.
"""
from django.apps import AppConfig


class NotificationsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "notifications"
    label = "notifications"
    verbose_name = "Notifications"

    def ready(self) -> None:
        # Imports inside ready() to avoid pulling app code at import-time
        # (Django boot order: settings → apps registry → ready hooks → urls).
        from events_bus.bus import subscribe

        from .handlers import handle_order_cancelled, handle_order_placed

        subscribe("order.placed", handle_order_placed)
        subscribe("order.cancelled", handle_order_cancelled)
