"""flags Django smoke — open + admin queue + resolve transitions."""
import pytest


@pytest.mark.django_db
def test_user_opens_flag_admin_sees_it(api_client, customer_headers, admin_headers):
    opened = api_client.post(
        "/api/flags",
        {"targetType": "post", "targetId": "p1", "reason": "spam"},
        format="json",
        **customer_headers,
    )
    assert opened.status_code == 201

    queue = api_client.get("/api/admin/flags?status=open", **admin_headers)
    ids = [f["targetId"] for f in queue.json()["items"]]
    assert "p1" in ids


@pytest.mark.django_db
def test_invalid_reason_rejected(api_client, customer_headers):
    res = api_client.post(
        "/api/flags",
        {"targetType": "post", "targetId": "p1", "reason": "rude"},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 400


@pytest.mark.django_db
def test_duplicate_open_is_idempotent(api_client, customer_headers, admin_headers):
    for _ in range(3):
        api_client.post(
            "/api/flags",
            {"targetType": "post", "targetId": "dup", "reason": "abuse"},
            format="json",
            **customer_headers,
        )
    queue = api_client.get("/api/admin/flags", **admin_headers)
    items = [f for f in queue.json()["items"] if f["targetId"] == "dup"]
    assert len(items) == 1


@pytest.mark.django_db
def test_admin_resolves_flag(api_client, customer_headers, admin_headers):
    opened = api_client.post(
        "/api/flags",
        {"targetType": "post", "targetId": "p2", "reason": "spam"},
        format="json",
        **customer_headers,
    )
    flag_id = opened.json()["id"]

    resolved = api_client.patch(
        f"/api/admin/flags/{flag_id}",
        {"status": "resolved", "resolverNote": "removed"},
        format="json",
        **admin_headers,
    )
    assert resolved.status_code == 200
    body = resolved.json()
    assert body["status"] == "resolved"
    assert body["resolverNote"] == "removed"


@pytest.mark.django_db
def test_admin_routes_require_admin(api_client, customer_headers):
    forbidden = api_client.get("/api/admin/flags", **customer_headers)
    assert forbidden.status_code == 403
