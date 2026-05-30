"""payment-stripe-subs Django smoke."""
import pytest


@pytest.mark.django_db
def test_admin_creates_plan_public_lists_it(api_client, admin_headers):
    create = api_client.post(
        "/api/admin/plans",
        {
            "key": "pro",
            "name": "Pro",
            "amountCents": 1900,
            "interval": "month",
        },
        format="json",
        **admin_headers,
    )
    assert create.status_code == 201
    listing = api_client.get("/api/plans")
    keys = [p["key"] for p in listing.json()["items"]]
    assert "pro" in keys


@pytest.mark.django_db
def test_plan_key_uniqueness(api_client, admin_headers):
    api_client.post(
        "/api/admin/plans",
        {"key": "dup", "name": "Dup", "amountCents": 100},
        format="json",
        **admin_headers,
    )
    second = api_client.post(
        "/api/admin/plans",
        {"key": "dup", "name": "Other", "amountCents": 200},
        format="json",
        **admin_headers,
    )
    assert second.status_code == 409


@pytest.mark.django_db
def test_checkout_requires_auth(api_client):
    res = api_client.post(
        "/api/subscriptions/checkout",
        {
            "planKey": "pro",
            "customerRef": "t-1",
            "successUrl": "https://example.com/ok",
            "cancelUrl": "https://example.com/cancel",
        },
        format="json",
    )
    assert res.status_code in {401, 403}


@pytest.mark.django_db
def test_webhook_dedupes_on_event_id(api_client):
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
    first = api_client.post("/webhooks/stripe-subs", payload, format="json")
    assert first.status_code == 200
    second = api_client.post("/webhooks/stripe-subs", payload, format="json")
    assert second.status_code == 200
    assert second.json().get("duplicate") is True


@pytest.mark.django_db
def test_webhook_rejects_missing_id(api_client):
    res = api_client.post(
        "/webhooks/stripe-subs",
        {"type": "noop"},
        format="json",
    )
    assert res.status_code == 400


@pytest.mark.django_db
def test_admin_plans_requires_admin(api_client, customer_headers):
    forbidden = api_client.post(
        "/api/admin/plans",
        {"key": "x", "name": "X", "amountCents": 100},
        format="json",
        **customer_headers,
    )
    assert forbidden.status_code == 403
