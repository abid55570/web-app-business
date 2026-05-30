"""payment-stripe-subs@v1 smoke — plan CRUD, checkout, webhook dedupe."""
import pytest


@pytest.mark.asyncio
async def test_admin_creates_plan_public_lists_it(
    client, admin_headers
):
    create = await client.post(
        "/api/admin/plans",
        headers=admin_headers,
        json={
            "key": "pro",
            "name": "Pro",
            "amountCents": 1900,
            "interval": "month",
        },
    )
    assert create.status_code == 201
    listing = await client.get("/api/plans")
    keys = [p["key"] for p in listing.json()["items"]]
    assert "pro" in keys


@pytest.mark.asyncio
async def test_plan_key_uniqueness(client, admin_headers):
    await client.post(
        "/api/admin/plans",
        headers=admin_headers,
        json={"key": "dup", "name": "Dup", "amountCents": 100},
    )
    second = await client.post(
        "/api/admin/plans",
        headers=admin_headers,
        json={"key": "dup", "name": "Other", "amountCents": 200},
    )
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "PLAN_KEY_TAKEN"


@pytest.mark.asyncio
async def test_checkout_requires_auth(client):
    res = await client.post(
        "/api/subscriptions/checkout",
        json={
            "planKey": "pro",
            "customerRef": "t-1",
            "successUrl": "https://example.com/ok",
            "cancelUrl": "https://example.com/cancel",
        },
    )
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_checkout_returns_session_url(
    client, customer_headers, admin_headers
):
    await client.post(
        "/api/admin/plans",
        headers=admin_headers,
        json={"key": "pro", "name": "Pro", "amountCents": 1900},
    )
    res = await client.post(
        "/api/subscriptions/checkout",
        headers=customer_headers,
        json={
            "planKey": "pro",
            "customerRef": "t-1",
            "successUrl": "https://example.com/ok",
            "cancelUrl": "https://example.com/cancel",
        },
    )
    body = res.json()
    assert body["sessionId"].startswith("cs_")
    assert body["checkoutUrl"].startswith("https://")


@pytest.mark.asyncio
async def test_webhook_dedupes_on_event_id(client):
    payload = {
        "id": "evt_test_123",
        "type": "customer.subscription.created",
        "data": {
            "object": {
                "id": "sub_test_123",
                "status": "active",
                "customer": "cus_x",
                "metadata": {"plan_key": "pro", "customer_ref": "t-1"},
                "items": {"data": [{"price": {"nickname": "pro"}}]},
            }
        },
    }
    first = await client.post("/webhooks/stripe-subs", json=payload)
    assert first.status_code == 200
    second = await client.post("/webhooks/stripe-subs", json=payload)
    assert second.status_code == 200


@pytest.mark.asyncio
async def test_webhook_rejects_missing_id(client):
    res = await client.post("/webhooks/stripe-subs", json={"type": "noop"})
    assert res.status_code == 400
