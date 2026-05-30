"""Django AppConfig for tags."""
from django.apps import AppConfig


class TagsConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "tags"
    label = "tags"
    verbose_name = "Tags"
