"""Shared pytest fixtures for the Django generated app.

Each module's smoke tests live under ``tests/<module>/`` and use Django's
test client (via DRF's ``APIClient``) plus pytest-django's ``db`` fixture
for transactional isolation.
"""
import pytest


@pytest.fixture
def api_client():
    from rest_framework.test import APIClient

    return APIClient()


@pytest.fixture
def make_user(db):
    """Factory — create a user and return ``(user, bearer_header)``."""
    from django.contrib.auth import get_user_model
    from rest_framework_simplejwt.tokens import RefreshToken

    User = get_user_model()

    def _factory(
        email: str = "test@example.com",
        password: str = "password123",
        role: str = "customer",
        name: str | None = "Test",
    ):
        user = User.objects.create_user(
            email=email.lower(),
            password=password,
            name=name,
            role=role,
        )
        access = str(RefreshToken.for_user(user).access_token)
        return user, {"HTTP_AUTHORIZATION": f"Bearer {access}"}

    return _factory


@pytest.fixture
def admin_headers(make_user):
    _, headers = make_user(email="admin@example.com", role="admin")
    return headers


@pytest.fixture
def customer_headers(make_user):
    _, headers = make_user(email="customer@example.com", role="customer")
    return headers
