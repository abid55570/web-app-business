"""auth-jwt Django smoke — mirrors the FastAPI auth-jwt suite.

Same 6 behaviours: signup returns user + token, dup email → 409,
login works after signup, wrong password → 401 AUTH_INVALID, unknown
user → same 401 AUTH_INVALID (enumeration safety), token from signup
is usable against /api/auth/me.
"""
import pytest


@pytest.mark.django_db
def test_signup_returns_user_and_session(api_client):
    res = api_client.post(
        "/api/auth/signup",
        {"email": "new@example.com", "password": "password123", "name": "New"},
        format="json",
    )
    assert res.status_code == 201, res.content
    body = res.json()
    assert body["user"]["email"] == "new@example.com"
    assert body["user"]["role"] == "customer"
    assert body["session"]["token"]
    assert body["session"]["userId"] == body["user"]["id"]


@pytest.mark.django_db
def test_signup_duplicate_email_returns_409(api_client):
    body = {"email": "dup@example.com", "password": "password123"}
    first = api_client.post("/api/auth/signup", body, format="json")
    assert first.status_code == 201
    again = api_client.post("/api/auth/signup", body, format="json")
    assert again.status_code == 409
    assert again.json()["code"] == "AUTH_EMAIL_TAKEN"


@pytest.mark.django_db
def test_login_works_after_signup(api_client):
    api_client.post(
        "/api/auth/signup",
        {"email": "loginok@example.com", "password": "password123"},
        format="json",
    )
    res = api_client.post(
        "/api/auth/login",
        {"email": "loginok@example.com", "password": "password123"},
        format="json",
    )
    assert res.status_code == 200
    assert res.json()["user"]["email"] == "loginok@example.com"


@pytest.mark.django_db
def test_login_wrong_password_is_401_invalid(api_client):
    api_client.post(
        "/api/auth/signup",
        {"email": "wrongpw@example.com", "password": "password123"},
        format="json",
    )
    res = api_client.post(
        "/api/auth/login",
        {"email": "wrongpw@example.com", "password": "totally-different"},
        format="json",
    )
    assert res.status_code == 401
    assert res.json()["code"] == "AUTH_INVALID"


@pytest.mark.django_db
def test_login_unknown_user_returns_same_invalid_code(api_client):
    """Same shape as wrong-password — prevents account enumeration."""
    res = api_client.post(
        "/api/auth/login",
        {"email": "ghost@example.com", "password": "anything"},
        format="json",
    )
    assert res.status_code == 401
    assert res.json()["code"] == "AUTH_INVALID"


@pytest.mark.django_db
def test_signup_token_is_usable_against_me(api_client):
    res = api_client.post(
        "/api/auth/signup",
        {"email": "afterme@example.com", "password": "password123"},
        format="json",
    )
    token = res.json()["session"]["token"]
    me = api_client.get("/api/auth/me", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert me.status_code == 200
    assert me.json()["email"] == "afterme@example.com"
