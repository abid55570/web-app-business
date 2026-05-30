"""Django AppConfig for media."""
from django.apps import AppConfig


class MediaConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "media"
    label = "media_assets"  # avoid clash with django.core.files.storage
    verbose_name = "Media"
