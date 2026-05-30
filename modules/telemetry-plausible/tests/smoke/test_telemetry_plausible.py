"""telemetry-plausible@v1 smoke — health + goal + disabled fallback."""
import pytest


@pytest.mark.asyncio
async def test_health_enabled_when_domain_set(client, monkeypatch):
    monkeypatch.setenv("PLAUSIBLE_DOMAIN", "acme.com")
    res = await client.get("/api/telemetry/plausible/health")
    body = res.json()
    assert body["enabled"] is True
    assert body["domain"] == "acme.com"


@pytest.mark.asyncio
async def test_health_disabled_without_domain(client, monkeypatch):
    monkeypatch.delenv("PLAUSIBLE_DOMAIN", raising=False)
    res = await client.get("/api/telemetry/plausible/health")
    assert res.json()["enabled"] is False
    assert res.json()["domain"] is None


@pytest.mark.asyncio
async def test_goal_returns_delivered_when_enabled(
    client, customer_headers, monkeypatch
):
    monkeypatch.setenv("PLAUSIBLE_DOMAIN", "acme.com")
    res = await client.post(
        "/api/telemetry/plausible/goal",
        headers=customer_headers,
        json={"name": "Signup", "url": "https://acme.com/welcome"},
    )
    assert res.status_code == 200
    assert res.json()["outcome"] == "delivered"


@pytest.mark.asyncio
async def test_goal_disabled_without_domain(
    client, customer_headers, monkeypatch
):
    monkeypatch.delenv("PLAUSIBLE_DOMAIN", raising=False)
    res = await client.post(
        "/api/telemetry/plausible/goal",
        headers=customer_headers,
        json={"name": "noop", "url": "https://x/"},
    )
    assert res.json()["outcome"] == "disabled"


@pytest.mark.asyncio
async def test_anon_cannot_send_goal(client):
    res = await client.post(
        "/api/telemetry/plausible/goal",
        json={"name": "anon", "url": "https://x/"},
    )
    assert res.status_code in {401, 403}
