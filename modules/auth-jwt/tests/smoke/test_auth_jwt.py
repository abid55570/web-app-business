"""auth-jwt@v1 smoke — signup + login + enumeration safety."""
import pytest


@pytest.mark.asyncio
async def test_signup_returns_user_and_session(client):
    res = await client.post(
        "/api/auth/signup",
        json={"email": "new@example.com", "password": "password123", "name": "New"},
    )
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["user"]["email"] == "new@example.com"
    assert body["user"]["role"] == "customer"
    assert body["session"]["token"]
    assert body["session"]["userId"] == body["user"]["id"]


@pytest.mark.asyncio
async def test_signup_duplicate_email_returns_409(client):
    body = {"email": "dup@example.com", "password": "password123"}
    first = await client.post("/api/auth/signup", json=body)
    assert first.status_code == 201
    again = await client.post("/api/auth/signup", json=body)
    assert again.status_code == 409
    assert again.json()["code"] == "AUTH_EMAIL_TAKEN"


@pytest.mark.asyncio
async def test_login_works_after_signup(client):
    await client.post(
        "/api/auth/signup",
        json={"email": "loginok@example.com", "password": "password123"},
    )
    res = await client.post(
        "/api/auth/login",
        json={"email": "loginok@example.com", "password": "password123"},
    )
    assert res.status_code == 200
    assert res.json()["user"]["email"] == "loginok@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password_is_401_invalid(client):
    await client.post(
        "/api/auth/signup",
        json={"email": "wrongpw@example.com", "password": "password123"},
    )
    res = await client.post(
        "/api/auth/login",
        json={"email": "wrongpw@example.com", "password": "totally-different"},
    )
    assert res.status_code == 401
    assert res.json()["code"] == "AUTH_INVALID"


@pytest.mark.asyncio
async def test_login_unknown_user_returns_same_invalid_code(client):
    """Same shape as wrong-password — prevents account enumeration."""
    res = await client.post(
        "/api/auth/login",
        json={"email": "ghost@example.com", "password": "anything"},
    )
    assert res.status_code == 401
    assert res.json()["code"] == "AUTH_INVALID"


@pytest.mark.asyncio
async def test_signup_token_is_usable_against_me(client):
    res = await client.post(
        "/api/auth/signup",
        json={"email": "afterme@example.com", "password": "password123"},
    )
    token = res.json()["session"]["token"]
    me = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me.status_code == 200
    assert me.json()["email"] == "afterme@example.com"
