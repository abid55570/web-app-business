"""Django AppConfig for boards."""
from django.apps import AppConfig


class BoardsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "boards"
    label = "boards"
    verbose_name = "Boards"
