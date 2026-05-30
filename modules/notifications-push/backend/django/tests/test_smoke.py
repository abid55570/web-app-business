"""notifications-push Django smoke."""
import pytest


PAYLOAD = {
    "endpoint": "https://fcm.googleapis.com/fcm/send/abc",
    "p256dhKey": "BG7" + "x" * 84,
    "authKey": "AB" + "x" * 22,
}


@pytest.mark.django_db
def test_subscribe_then_my(api_client, customer_headers):
    s = api_client.post(
        "/api/notifications/push/subscriptions",
        PAYLOAD,
        format="json",
        **customer_headers,
    )
    assert s.status_code in {200, 201}
    listing = api_client.get(
        "/api/notifications/push/subscriptions/my", **customer_headers
    )
    endpoints = [r["endpoint"] for r in listing.json()["items"]]
    assert PAYLOAD["endpoint"] in endpoints


@pytest.mark.django_db
def test_re_subscribe_updates_keys(api_client, customer_headers):
    api_client.post(
        "/api/notifications/push/subscriptions",
        PAYLOAD,
        format="json",
        **customer_headers,
    )
    updated = api_client.post(
        "/api/notifications/push/subscriptions",
        {**PAYLOAD, "authKey": "NEW" + "x" * 21},
        format="json",
        **customer_headers,
    )
    assert updated.status_code in {200, 201}
    listing = api_client.get(
        "/api/notifications/push/subscriptions/my", **customer_headers
    )
    assert listing.json()["total"] == 1


@pytest.mark.django_db
def test_anon_cannot_subscribe(api_client):
    res = api_client.post(
        "/api/notifications/push/subscriptions",
        PAYLOAD,
        format="json",
    )
    assert res.status_code in {401, 403}


@pytest.mark.django_db
def test_admin_send_returns_delivered_count(
    api_client, customer_headers, admin_headers, customer_id
):
    api_client.post(
        "/api/notifications/push/subscriptions",
        PAYLOAD,
        format="json",
        **customer_headers,
    )
    res = api_client.post(
        "/api/notifications/push/send",
        {"userId": customer_id, "payload": {"title": "Hi"}},
        format="json",
        **admin_headers,
    )
    assert res.status_code == 200
    assert res.json()["deliveredCount"] == 1


@pytest.mark.django_db
def test_send_requires_admin(api_client, customer_headers, customer_id):
    forbidden = api_client.post(
        "/api/notifications/push/send",
        {"userId": customer_id, "payload": {"title": "Hi"}},
        format="json",
        **customer_headers,
    )
    assert forbidden.status_code == 403
