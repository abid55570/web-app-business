"""telemetry-sentry@v1 smoke — health probe + manual capture (admin)."""
import pytest


@pytest.mark.asyncio
async def test_health_initialized_when_dsn_set(client, monkeypatch):
    monkeypatch.setenv("SENTRY_DSN", "https://stubkey@stub.io/1")
    res = await client.get("/api/telemetry/sentry/health")
    assert res.status_code == 200
    assert res.json()["initialized"] is True


@pytest.mark.asyncio
async def test_health_not_initialized_without_dsn(client, monkeypatch):
    monkeypatch.delenv("SENTRY_DSN", raising=False)
    # Reset the module-level _initialized flag so a previous test in this
    # process doesn't make this one falsely pass.
    from app.telemetry_sentry import client as sentry_client

    sentry_client._initialized = False  # type: ignore[attr-defined]
    res = await client.get("/api/telemetry/sentry/health")
    assert res.json()["initialized"] is False


@pytest.mark.asyncio
async def test_capture_requires_admin(client, customer_headers):
    forbidden = await client.post(
        "/api/telemetry/sentry/capture",
        headers=customer_headers,
        json={"message": "boom", "level": "error"},
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_admin_can_capture(client, admin_headers, monkeypatch):
    monkeypatch.setenv("SENTRY_DSN", "https://stubkey@stub.io/1")
    from app.telemetry_sentry import client as sentry_client

    sentry_client._initialized = False  # type: ignore[attr-defined]
    res = await client.post(
        "/api/telemetry/sentry/capture",
        headers=admin_headers,
        json={"message": "boom", "level": "error", "fingerprint": "test"},
    )
    assert res.status_code == 200
    body = res.json()
    assert body["captured"] is True
    assert body["eventId"] is not None
