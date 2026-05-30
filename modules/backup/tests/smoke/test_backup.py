"""backup@v1 smoke — trigger / list / admin gate / fail-without-bucket."""
import pytest


@pytest.mark.asyncio
async def test_admin_trigger_succeeds_with_bucket(
    client, admin_headers, monkeypatch
):
    monkeypatch.setenv("BACKUP_S3_BUCKET", "test-bucket")
    monkeypatch.setenv("DATABASE_URL", "postgres://user:pass@host/db")
    res = await client.post(
        "/api/admin/backup/trigger",
        headers=admin_headers,
        json={"kind": "manual"},
    )
    assert res.status_code == 201
    body = res.json()
    assert body["kind"] == "manual"
    assert body["status"] == "succeeded"
    assert body["s3Key"]
    assert body["sizeBytes"] > 0


@pytest.mark.asyncio
async def test_trigger_fails_without_bucket(
    client, admin_headers, monkeypatch
):
    monkeypatch.delenv("BACKUP_S3_BUCKET", raising=False)
    res = await client.post(
        "/api/admin/backup/trigger",
        headers=admin_headers,
        json={"kind": "manual"},
    )
    body = res.json()
    assert body["status"] == "failed"
    assert "BACKUP_S3_BUCKET" in body["reason"]


@pytest.mark.asyncio
async def test_list_filters_by_status(client, admin_headers, monkeypatch):
    monkeypatch.setenv("BACKUP_S3_BUCKET", "test-bucket")
    monkeypatch.setenv("DATABASE_URL", "postgres://user:pass@host/db")
    await client.post(
        "/api/admin/backup/trigger",
        headers=admin_headers,
        json={"kind": "scheduled"},
    )
    listing = await client.get(
        "/api/admin/backup?status=succeeded", headers=admin_headers
    )
    statuses = {j["status"] for j in listing.json()["items"]}
    assert statuses.issubset({"succeeded"})


@pytest.mark.asyncio
async def test_admin_routes_require_admin(client, customer_headers):
    forbidden = await client.get(
        "/api/admin/backup", headers=customer_headers
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_purge_returns_count(client, admin_headers):
    res = await client.post(
        "/api/admin/backup/purge?retentionDays=1", headers=admin_headers
    )
    assert res.status_code == 200
    assert "purged" in res.json()
