"""Django AppConfig for auth-oauth."""
from django.apps import AppConfig


class AuthOauthConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_oauth"
    label = "auth_oauth"
    verbose_name = "Auth — OAuth"
