"""Django AppConfig for events-bus."""
from django.apps import AppConfig


class EventsBusConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "events_bus"
    label = "events_bus"
    verbose_name = "Events bus (in-process)"
