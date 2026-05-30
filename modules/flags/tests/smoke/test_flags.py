"""flags@v1 smoke — open + idempotent + admin queue + resolve."""
import pytest


@pytest.mark.asyncio
async def test_user_opens_flag_admin_sees_it(
    client, customer_headers, admin_headers
):
    opened = await client.post(
        "/api/flags",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1", "reason": "spam"},
    )
    assert opened.status_code == 201

    queue = await client.get(
        "/api/admin/flags?status=open", headers=admin_headers
    )
    ids = [f["targetId"] for f in queue.json()["items"]]
    assert "p1" in ids


@pytest.mark.asyncio
async def test_invalid_reason_rejected(client, customer_headers):
    res = await client.post(
        "/api/flags",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1", "reason": "rude"},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "FLAG_REASON_INVALID"


@pytest.mark.asyncio
async def test_duplicate_open_is_idempotent(
    client, customer_headers, admin_headers
):
    for _ in range(3):
        await client.post(
            "/api/flags",
            headers=customer_headers,
            json={"targetType": "post", "targetId": "dup", "reason": "abuse"},
        )
    queue = await client.get("/api/admin/flags", headers=admin_headers)
    items = [f for f in queue.json()["items"] if f["targetId"] == "dup"]
    assert len(items) == 1


@pytest.mark.asyncio
async def test_admin_resolves_flag(
    client, customer_headers, admin_headers
):
    opened = await client.post(
        "/api/flags",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p2", "reason": "spam"},
    )
    flag_id = opened.json()["id"]

    resolved = await client.patch(
        f"/api/admin/flags/{flag_id}",
        headers=admin_headers,
        json={"status": "resolved", "resolverNote": "removed"},
    )
    assert resolved.status_code == 200
    assert resolved.json()["status"] == "resolved"
    assert resolved.json()["resolverNote"] == "removed"


@pytest.mark.asyncio
async def test_admin_routes_require_admin(client, customer_headers):
    forbidden = await client.get(
        "/api/admin/flags", headers=customer_headers
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_for_target_admin_lookup(
    client, customer_headers, other_customer_headers, admin_headers
):
    await client.post(
        "/api/flags",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "hot", "reason": "spam"},
    )
    await client.post(
        "/api/flags",
        headers=other_customer_headers,
        json={"targetType": "post", "targetId": "hot", "reason": "abuse"},
    )

    res = await client.get(
        "/api/admin/flags/for-target?targetType=post&targetId=hot",
        headers=admin_headers,
    )
    assert res.json()["total"] == 2
