"""auth-oauth Django smoke — stub provider callback flow."""
import pytest


@pytest.mark.django_db
def test_unknown_provider_is_400(api_client):
    res = api_client.get("/api/auth/oauth/myspace/callback?code=abc")
    assert res.status_code == 400
    assert res.json()["code"] == "AUTH_OAUTH_PROVIDER_UNKNOWN"


@pytest.mark.django_db
def test_empty_code_is_400(api_client):
    res = api_client.get("/api/auth/oauth/google/callback?code=")
    assert res.status_code == 400
    assert res.json()["code"] == "AUTH_OAUTH_CODE_INVALID"


@pytest.mark.django_db
def test_google_callback_creates_user_and_session(api_client):
    res = api_client.get("/api/auth/oauth/google/callback?code=user1")
    assert res.status_code == 200, res.content
    body = res.json()
    assert body["user"]["email"] == "user1@gmail.example"
    assert body["user"]["emailVerified"] is True
    assert body["session"]["token"]


@pytest.mark.django_db
def test_google_callback_idempotent_on_repeat(api_client):
    first = api_client.get("/api/auth/oauth/google/callback?code=user2")
    second = api_client.get("/api/auth/oauth/google/callback?code=user2")
    assert first.json()["user"]["id"] == second.json()["user"]["id"]


@pytest.mark.django_db
def test_oauth_token_is_usable_against_me(api_client):
    res = api_client.get("/api/auth/oauth/github/callback?code=user3")
    token = res.json()["session"]["token"]
    me = api_client.get("/api/auth/me", HTTP_AUTHORIZATION=f"Bearer {token}")
    assert me.status_code == 200
    assert me.json()["email"] == "user3@users.noreply.github.example"
