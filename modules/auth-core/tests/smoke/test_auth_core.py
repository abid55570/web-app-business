"""auth-core@v1 smoke — /me /logout /change-password + role enforcement."""
import pytest


@pytest.mark.asyncio
async def test_me_returns_current_user(client, customer_headers):
    res = await client.get("/api/auth/me", headers=customer_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["email"] == "customer@example.com"
    assert body["role"] == "customer"


@pytest.mark.asyncio
async def test_me_without_token_is_401(client):
    res = await client.get("/api/auth/me")
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "AUTH_MISSING_TOKEN"


@pytest.mark.asyncio
async def test_me_with_garbage_token_is_401_invalid(client):
    res = await client.get(
        "/api/auth/me", headers={"Authorization": "Bearer not-a-real-jwt"}
    )
    assert res.status_code == 401
    assert res.json()["detail"]["code"] == "AUTH_INVALID_TOKEN"


@pytest.mark.asyncio
async def test_logout_returns_204(client, customer_headers):
    res = await client.post("/api/auth/logout", headers=customer_headers)
    assert res.status_code == 204


@pytest.mark.asyncio
async def test_change_password_requires_current_when_password_set(
    client, customer_headers
):
    res = await client.post(
        "/api/auth/change-password",
        headers=customer_headers,
        json={"newPassword": "totally-new-password"},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "AUTH_CURRENT_PASSWORD_INVALID"


@pytest.mark.asyncio
async def test_change_password_succeeds_with_correct_current(
    client, customer_headers
):
    res = await client.post(
        "/api/auth/change-password",
        headers=customer_headers,
        json={"currentPassword": "password123", "newPassword": "newer-password"},
    )
    assert res.status_code == 204
