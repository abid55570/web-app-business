"""feature-flags@v1 smoke — resolution layers + CRUD + admin gate."""
import pytest


@pytest.mark.asyncio
async def test_unknown_key_is_disabled(client):
    res = await client.get("/api/feature-flags/check/unknown")
    assert res.status_code == 200
    assert res.json()["enabled"] is False


@pytest.mark.asyncio
async def test_disabled_flag_kills_audience_match(client, admin_headers):
    await client.post(
        "/api/admin/feature-flags",
        headers=admin_headers,
        json={
            "key": "billing-v2",
            "enabled": False,
            "audiences": ["tenant:acme"],
            "rolloutPercent": 100,
        },
    )
    res = await client.get(
        "/api/feature-flags/check/billing-v2?audience=tenant:acme"
    )
    assert res.json()["enabled"] is False


@pytest.mark.asyncio
async def test_audience_match_enables(client, admin_headers):
    await client.post(
        "/api/admin/feature-flags",
        headers=admin_headers,
        json={
            "key": "beta-ui",
            "enabled": True,
            "audiences": ["tenant:acme"],
            "rolloutPercent": 0,
        },
    )
    yes = await client.get(
        "/api/feature-flags/check/beta-ui?audience=tenant:acme"
    )
    no = await client.get(
        "/api/feature-flags/check/beta-ui?audience=tenant:other"
    )
    assert yes.json()["enabled"] is True
    assert no.json()["enabled"] is False


@pytest.mark.asyncio
async def test_full_rollout_enables_everyone(client, admin_headers):
    await client.post(
        "/api/admin/feature-flags",
        headers=admin_headers,
        json={"key": "ga-feature", "enabled": True, "rolloutPercent": 100},
    )
    yes = await client.get(
        "/api/feature-flags/check/ga-feature?audience=anyone"
    )
    assert yes.json()["enabled"] is True


@pytest.mark.asyncio
async def test_partial_rollout_is_deterministic(client, admin_headers):
    """Same audience + same key → same bucket → same answer every time."""
    await client.post(
        "/api/admin/feature-flags",
        headers=admin_headers,
        json={"key": "phased", "enabled": True, "rolloutPercent": 50},
    )
    first = await client.get(
        "/api/feature-flags/check/phased?audience=user:stable"
    )
    second = await client.get(
        "/api/feature-flags/check/phased?audience=user:stable"
    )
    assert first.json()["enabled"] == second.json()["enabled"]


@pytest.mark.asyncio
async def test_admin_routes_require_admin(client, customer_headers):
    forbidden = await client.post(
        "/api/admin/feature-flags",
        headers=customer_headers,
        json={"key": "x", "enabled": True},
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_key_uniqueness_is_enforced(client, admin_headers):
    await client.post(
        "/api/admin/feature-flags",
        headers=admin_headers,
        json={"key": "dup", "enabled": True},
    )
    second = await client.post(
        "/api/admin/feature-flags",
        headers=admin_headers,
        json={"key": "dup", "enabled": False},
    )
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "FLAG_KEY_TAKEN"
