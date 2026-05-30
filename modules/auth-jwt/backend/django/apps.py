"""Django AppConfig for auth-jwt."""
from django.apps import AppConfig


class AuthJwtConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "auth_jwt"
    label = "auth_jwt"
    verbose_name = "Auth — email + password (JWT)"
