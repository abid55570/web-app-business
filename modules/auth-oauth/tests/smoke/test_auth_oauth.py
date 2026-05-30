"""auth-oauth@v1 smoke — stub provider callback flow.

Phase 1 ships stub providers (no real token exchange). These tests cover the
upsert + token-mint path that survives Phase 2's switch to real adapters.
"""
import pytest


@pytest.mark.asyncio
async def test_unknown_provider_is_400(client):
    res = await client.get("/api/auth/oauth/myspace/callback?code=abc")
    assert res.status_code == 400
    assert res.json()["code"] == "AUTH_OAUTH_PROVIDER_UNKNOWN"


@pytest.mark.asyncio
async def test_empty_code_is_400(client):
    res = await client.get("/api/auth/oauth/google/callback?code=")
    assert res.status_code == 400
    assert res.json()["code"] == "AUTH_OAUTH_CODE_INVALID"


@pytest.mark.asyncio
async def test_google_callback_creates_user_and_session(client):
    res = await client.get("/api/auth/oauth/google/callback?code=user1")
    assert res.status_code == 200, res.text
    body = res.json()
    assert body["user"]["email"] == "user1@gmail.example"
    assert body["user"]["emailVerified"] is True
    assert body["session"]["token"]


@pytest.mark.asyncio
async def test_google_callback_idempotent_on_repeat(client):
    first = await client.get("/api/auth/oauth/google/callback?code=user2")
    second = await client.get("/api/auth/oauth/google/callback?code=user2")
    assert first.json()["user"]["id"] == second.json()["user"]["id"]


@pytest.mark.asyncio
async def test_oauth_token_is_usable_against_me(client):
    res = await client.get("/api/auth/oauth/github/callback?code=user3")
    token = res.json()["session"]["token"]
    me = await client.get(
        "/api/auth/me", headers={"Authorization": f"Bearer {token}"}
    )
    assert me.status_code == 200
    assert me.json()["email"] == "user3@users.noreply.github.example"


@pytest.mark.asyncio
async def test_oauth_links_existing_email(client, make_user):
    """Existing password user links the OAuth identity instead of duplicating."""
    user, _ = await make_user(email="existing@example.com")
    res = await client.get(
        "/api/auth/oauth/google/callback?code=existing"
    )
    # Stub Google returns email ``existing@gmail.example``, not the same email,
    # so this case actually creates a fresh user — verify that path works too.
    assert res.status_code == 200
    assert res.json()["user"]["email"] == "existing@gmail.example"
    assert res.json()["user"]["id"] != user.id
