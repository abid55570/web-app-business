"""User model — shared across all auth strategies (auth-jwt, auth-oauth, ...).

Set ``AUTH_USER_MODEL = "auth_core.User"`` in Django settings (the wirer
exports ``DJANGO_AUTH_USER_MODEL=auth_core.User`` automatically when this
module is in the recipe).
"""
from django.contrib.auth.base_user import AbstractBaseUser, BaseUserManager
from django.contrib.auth.models import PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    """Email-as-username manager."""

    use_in_migrations = True

    def _create(self, email: str, password: str | None, **extra) -> "User":
        if not email:
            raise ValueError("email is required")
        user = self.model(email=self.normalize_email(email).lower(), **extra)
        if password:
            user.set_password(password)
        else:
            user.set_unusable_password()
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra):
        extra.setdefault("role", "customer")
        extra.setdefault("is_staff", False)
        extra.setdefault("is_superuser", False)
        return self._create(email, password, **extra)

    def create_superuser(self, email, password=None, **extra):
        extra.setdefault("role", "owner")
        extra.setdefault("is_staff", True)
        extra.setdefault("is_superuser", True)
        return self._create(email, password, **extra)


ROLE_CHOICES = [
    ("customer", "Customer"),
    ("staff", "Staff"),
    ("admin", "Admin"),
    ("owner", "Owner"),
]


class User(AbstractBaseUser, PermissionsMixin):
    email = models.EmailField(unique=True, db_index=True)
    name = models.CharField(max_length=255, blank=True, null=True)
    phone = models.CharField(max_length=32, blank=True, null=True)
    role = models.CharField(
        max_length=32,
        choices=ROLE_CHOICES,
        default="customer",
        db_index=True,
    )
    oauth_provider = models.CharField(max_length=32, blank=True, null=True)
    oauth_subject = models.CharField(max_length=255, blank=True, null=True)
    email_verified = models.BooleanField(default=False)
    mfa_enabled = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS: list[str] = []

    class Meta:
        db_table = "users"
        indexes = [
            models.Index(fields=["oauth_provider", "oauth_subject"]),
        ]

    def __str__(self) -> str:
        return self.email
