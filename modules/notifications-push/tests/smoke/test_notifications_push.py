"""notifications-push@v1 smoke — subscribe + my + admin send + idempotent."""
import pytest


PAYLOAD = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/abc",
    "p256dhKey": "BG7" + "x" * 84,
    "authKey": "AB" + "x" * 22,
}


@pytest.mark.asyncio
async def test_subscribe_then_my(client, customer_headers):
    s = await client.post(
        "/api/notifications/push/subscriptions",
        headers=customer_headers,
        json=PAYLOAD,
    )
    assert s.status_code in {200, 201}
    listing = await client.get(
        "/api/notifications/push/subscriptions/my",
        headers=customer_headers,
    )
    endpoints = [r["endpoint"] for r in listing.json()["items"]]
    assert PAYLOAD["endpoint"] in endpoints


@pytest.mark.asyncio
async def test_re_subscribe_is_idempotent(client, customer_headers):
    for _ in range(3):
        await client.post(
            "/api/notifications/push/subscriptions",
            headers=customer_headers,
            json=PAYLOAD,
        )
    listing = await client.get(
        "/api/notifications/push/subscriptions/my",
        headers=customer_headers,
    )
    assert listing.json()["total"] == 1


@pytest.mark.asyncio
async def test_anon_cannot_subscribe(client):
    res = await client.post(
        "/api/notifications/push/subscriptions", json=PAYLOAD
    )
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_admin_send_returns_delivered(
    client, customer_headers, admin_headers, customer_id
):
    await client.post(
        "/api/notifications/push/subscriptions",
        headers=customer_headers,
        json=PAYLOAD,
    )
    res = await client.post(
        "/api/notifications/push/send",
        headers=admin_headers,
        json={"userId": customer_id, "payload": {"title": "Hi"}},
    )
    assert res.status_code == 200
    assert res.json()["deliveredCount"] == 1


@pytest.mark.asyncio
async def test_send_requires_admin(client, customer_headers, customer_id):
    forbidden = await client.post(
        "/api/notifications/push/send",
        headers=customer_headers,
        json={"userId": customer_id, "payload": {}},
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_vapid_key_is_public(client):
    res = await client.get("/api/notifications/push/vapid-public-key")
    assert res.status_code == 200
    assert "publicKey" in res.json()
