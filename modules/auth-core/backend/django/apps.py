"""Django app config — labels the app + opts into the AUTH_USER_MODEL slot."""
from django.apps import AppConfig


class AuthCoreConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_core"
    label = "auth_core"
    verbose_name = "Auth (core)"
