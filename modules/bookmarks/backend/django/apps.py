"""Django AppConfig for bookmarks."""
from django.apps import AppConfig


class BookmarksConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "bookmarks"
    label = "bookmarks"
    verbose_name = "Bookmarks"
