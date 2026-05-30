"""Django AppConfig for menu."""
from django.apps import AppConfig


class MenuConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "menu"
    label = "menu"
    verbose_name = "Menu"
