"""notifications Django smoke — admin log read + role enforcement +
cross-module event chain (orders.placed → handler → NotificationLog row).
"""
import pytest

from notifications.models import NotificationLog


@pytest.mark.django_db
def test_admin_can_list_notifications(api_client, admin_headers):
    NotificationLog.objects.create(
        channel="in-app",
        recipient="customer-1",
        template="order.placed",
        payload={"orderId": "abc"},
        status="sent-test",
        triggered_by_event="order.placed",
    )
    res = api_client.get("/api/admin/notifications", **admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert body["total"] == 1
    n = body["notifications"][0]
    assert n["channel"] == "in-app"
    assert n["template"] == "order.placed"
    assert n["triggeredByEvent"] == "order.placed"


@pytest.mark.django_db
def test_admin_only(api_client, customer_headers):
    res = api_client.get("/api/admin/notifications", **customer_headers)
    assert res.status_code == 403
    assert res.json()["code"] == "AUTH_FORBIDDEN"


@pytest.mark.django_db
def test_order_placed_event_creates_notification_log(
    api_client, admin_headers, customer_headers
):
    """The bus subscription registered in NotificationsConfig.ready() MUST
    fire when orders emit. Mirrors the FastAPI cross-module integration test."""
    seed = api_client.post(
        "/api/admin/menu",
        {"name": "Burger", "price": "9.00", "category": "main"},
        format="json",
        **admin_headers,
    )
    item = seed.json()
    api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **customer_headers,
    )

    logs = api_client.get("/api/admin/notifications", **admin_headers)
    assert logs.status_code == 200
    body = logs.json()
    triggered = [
        n for n in body["notifications"] if n["triggeredByEvent"] == "order.placed"
    ]
    assert len(triggered) == 1
    n = triggered[0]
    assert n["channel"] == "in-app"
    assert n["template"] == "order.placed"
    assert n["status"] in {"sent", "sent-test"}


@pytest.mark.django_db
def test_filter_by_channel(api_client, admin_headers):
    NotificationLog.objects.create(
        channel="in-app",
        recipient="x",
        template="t",
        status="sent-test",
    )
    NotificationLog.objects.create(
        channel="email",
        recipient="x",
        template="t",
        status="sent-test",
    )
    in_app = api_client.get(
        "/api/admin/notifications?channel=in-app", **admin_headers
    )
    assert in_app.json()["total"] == 1
    assert in_app.json()["notifications"][0]["channel"] == "in-app"

    email = api_client.get(
        "/api/admin/notifications?channel=email", **admin_headers
    )
    assert email.json()["total"] == 1
    assert email.json()["notifications"][0]["channel"] == "email"
