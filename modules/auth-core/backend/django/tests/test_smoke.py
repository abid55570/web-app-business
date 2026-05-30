"""auth-core Django smoke — /me /logout /change-password.

Mirrors the FastAPI smoke suite so cross-stack behaviour stays in lockstep.
Lives next to the Django source so the wirer copies it under
``<out>/backend/auth_core/tests/``; pytest-django picks it up via the
scaffold's pyproject ``DJANGO_SETTINGS_MODULE``.
"""
import pytest


@pytest.mark.django_db
def test_me_returns_current_user(api_client, customer_headers):
    res = api_client.get("/api/auth/me", **customer_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == "customer@example.com"
    assert body["role"] == "customer"


@pytest.mark.django_db
def test_me_without_token_is_401(api_client):
    res = api_client.get("/api/auth/me")
    assert res.status_code == 401


@pytest.mark.django_db
def test_logout_returns_204(api_client, customer_headers):
    res = api_client.post("/api/auth/logout", **customer_headers)
    assert res.status_code == 204


@pytest.mark.django_db
def test_change_password_requires_current_when_set(api_client, customer_headers):
    res = api_client.post(
        "/api/auth/change-password",
        {"newPassword": "totally-new-password"},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 400
    assert res.json()["code"] == "AUTH_CURRENT_PASSWORD_INVALID"


@pytest.mark.django_db
def test_change_password_succeeds_with_correct_current(
    api_client, customer_headers
):
    res = api_client.post(
        "/api/auth/change-password",
        {"currentPassword": "password123", "newPassword": "newer-password"},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 204
