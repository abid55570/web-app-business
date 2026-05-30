"""telemetry-posthog@v1 smoke — health + track + disabled fallback."""
import pytest


@pytest.mark.asyncio
async def test_health_enabled_when_key_set(client, monkeypatch):
    monkeypatch.setenv("POSTHOG_API_KEY", "phc_stub")
    res = await client.get("/api/telemetry/posthog/health")
    assert res.status_code == 200
    body = res.json()
    assert body["enabled"] is True
    assert body["host"].startswith("https://")


@pytest.mark.asyncio
async def test_health_disabled_without_key(client, monkeypatch):
    monkeypatch.delenv("POSTHOG_API_KEY", raising=False)
    res = await client.get("/api/telemetry/posthog/health")
    assert res.json()["enabled"] is False


@pytest.mark.asyncio
async def test_track_returns_delivered_when_enabled(
    client, customer_headers, monkeypatch
):
    monkeypatch.setenv("POSTHOG_API_KEY", "phc_stub")
    res = await client.post(
        "/api/telemetry/posthog/track",
        headers=customer_headers,
        json={"event": "signup.completed", "properties": {"plan": "pro"}},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["event"] == "signup.completed"
    assert body["outcome"] == "delivered"


@pytest.mark.asyncio
async def test_track_disabled_when_no_key(
    client, customer_headers, monkeypatch
):
    monkeypatch.delenv("POSTHOG_API_KEY", raising=False)
    res = await client.post(
        "/api/telemetry/posthog/track",
        headers=customer_headers,
        json={"event": "noop"},
    )
    assert res.json()["outcome"] == "disabled"


@pytest.mark.asyncio
async def test_anon_cannot_track(client):
    res = await client.post(
        "/api/telemetry/posthog/track",
        json={"event": "anon"},
    )
    assert res.status_code in {401, 403}
