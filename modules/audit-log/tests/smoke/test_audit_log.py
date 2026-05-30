"""audit-log@v1 smoke — record, admin filter, gate, metadata round-trip."""
import pytest


@pytest.mark.asyncio
async def test_user_records_event_admin_sees_it(
    client, customer_headers, admin_headers
):
    recorded = await client.post(
        "/api/audit",
        headers=customer_headers,
        json={
            "action": "post.publish",
            "targetType": "post",
            "targetId": "p1",
            "metadata": {"slug": "hello-world"},
        },
    )
    assert recorded.status_code == 201

    listing = await client.get(
        "/api/admin/audit?action=post.publish", headers=admin_headers
    )
    actions = [e["action"] for e in listing.json()["items"]]
    assert actions == ["post.publish"]


@pytest.mark.asyncio
async def test_metadata_round_trips_as_dict(
    client, customer_headers, admin_headers
):
    await client.post(
        "/api/audit",
        headers=customer_headers,
        json={"action": "x", "metadata": {"a": 1, "b": "two"}},
    )
    listing = await client.get(
        "/api/admin/audit?action=x", headers=admin_headers
    )
    meta = listing.json()["items"][0]["metadata"]
    assert meta == {"a": 1, "b": "two"}


@pytest.mark.asyncio
async def test_admin_read_requires_admin(client, customer_headers):
    forbidden = await client.get(
        "/api/admin/audit", headers=customer_headers
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_anon_cannot_record(client):
    res = await client.post("/api/audit", json={"action": "x"})
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_target_filter_narrows_results(
    client, customer_headers, admin_headers
):
    for tid in ("a", "b", "a"):
        await client.post(
            "/api/audit",
            headers=customer_headers,
            json={
                "action": "post.publish",
                "targetType": "post",
                "targetId": tid,
            },
        )
    listing = await client.get(
        "/api/admin/audit?targetType=post&targetId=a",
        headers=admin_headers,
    )
    assert listing.json()["total"] == 2


@pytest.mark.asyncio
async def test_limit_caps_response(
    client, customer_headers, admin_headers
):
    for _ in range(5):
        await client.post(
            "/api/audit",
            headers=customer_headers,
            json={"action": "spam"},
        )
    listing = await client.get(
        "/api/admin/audit?action=spam&limit=2", headers=admin_headers
    )
    assert listing.json()["total"] == 2
