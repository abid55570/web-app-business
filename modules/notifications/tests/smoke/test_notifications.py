"""notifications@v1 smoke — handler dispatch on bus event + admin log read.

Verifies the cross-module event chain:
  orders.create_order → emit("order.placed") → notifications.handle_order_placed
  → dispatch("in-app") → NotificationLog row → emit("notifications.sent")
"""
import pytest


async def _seed_menu_item(client, admin_headers, name="Burger", price="9.00"):
    res = await client.post(
        "/api/admin/menu",
        headers=admin_headers,
        json={"name": name, "price": price, "category": "main"},
    )
    return res.json()


@pytest.mark.asyncio
async def test_order_placed_event_creates_notification_log(
    client, admin_headers, customer_headers
):
    """The bus subscription registered at startup MUST fire when orders emit."""
    item = await _seed_menu_item(client, admin_headers)

    await client.post(
        "/api/orders",
        headers=customer_headers,
        json={"items": [{"itemId": item["id"], "qty": 1}]},
    )

    logs = await client.get(
        "/api/admin/notifications", headers=admin_headers
    )
    assert logs.status_code == 200
    body = logs.json()
    assert body["total"] >= 1
    triggered = [
        n for n in body["notifications"] if n["triggeredByEvent"] == "order.placed"
    ]
    assert len(triggered) == 1
    n = triggered[0]
    assert n["channel"] == "in-app"
    assert n["template"] == "order.placed"
    assert n["status"] in {"sent", "sent-test"}


@pytest.mark.asyncio
async def test_notifications_admin_only(client, customer_headers):
    res = await client.get(
        "/api/admin/notifications", headers=customer_headers
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_notifications_filtered_by_channel(
    client, admin_headers, customer_headers
):
    item = await _seed_menu_item(client, admin_headers)
    await client.post(
        "/api/orders",
        headers=customer_headers,
        json={"items": [{"itemId": item["id"], "qty": 1}]},
    )

    in_app = await client.get(
        "/api/admin/notifications?channel=in-app", headers=admin_headers
    )
    assert in_app.status_code == 200
    assert all(n["channel"] == "in-app" for n in in_app.json()["notifications"])

    email = await client.get(
        "/api/admin/notifications?channel=email", headers=admin_headers
    )
    assert email.status_code == 200
    assert email.json()["total"] == 0  # default channels = ["in-app"] only
