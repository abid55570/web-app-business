"""backup Django smoke."""
import pytest


@pytest.mark.django_db
def test_admin_trigger_creates_job(api_client, admin_headers, monkeypatch):
    monkeypatch.setenv("BACKUP_S3_BUCKET", "test-bucket")
    res = api_client.post(
        "/api/admin/backup/trigger",
        {"kind": "manual"},
        format="json",
        **admin_headers,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["kind"] == "manual"
    assert body["status"] in {"succeeded", "failed"}


@pytest.mark.django_db
def test_trigger_fails_without_bucket(api_client, admin_headers, monkeypatch):
    monkeypatch.delenv("BACKUP_S3_BUCKET", raising=False)
    res = api_client.post(
        "/api/admin/backup/trigger",
        {"kind": "manual"},
        format="json",
        **admin_headers,
    )
    assert res.status_code == 201
    body = res.json()
    assert body["status"] == "failed"
    assert "BACKUP_S3_BUCKET" in body["reason"]


@pytest.mark.django_db
def test_admin_routes_require_admin(api_client, customer_headers):
    forbidden = api_client.get("/api/admin/backup", **customer_headers)
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_list_filters_by_status(api_client, admin_headers, monkeypatch):
    monkeypatch.setenv("BACKUP_S3_BUCKET", "test-bucket")
    api_client.post(
        "/api/admin/backup/trigger",
        {"kind": "scheduled"},
        format="json",
        **admin_headers,
    )
    listing = api_client.get(
        "/api/admin/backup?status=succeeded", **admin_headers
    )
    statuses = {j["status"] for j in listing.json()["items"]}
    assert statuses.issubset({"succeeded"})
