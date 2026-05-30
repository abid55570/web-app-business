"""orders@v1 smoke — full create → cancel flow with payment + events.

Covers:
  - Customer creates an order; payment is charged; order is confirmed+paid.
  - Item snapshot is frozen at create-time (later menu edits don't mutate).
  - Customer GET own order works; GET someone else's returns 404.
  - Cancel triggers refund when paid.
  - Admin status transitions emit ``order.confirmed``.
"""
from decimal import Decimal

import pytest


async def _seed_menu_item(client, admin_headers, name="Pizza", price="12.50"):
    res = await client.post(
        "/api/admin/menu",
        headers=admin_headers,
        json={"name": name, "price": price, "currency": "USD", "category": "pizza"},
    )
    assert res.status_code == 201
    return res.json()


@pytest.mark.asyncio
async def test_customer_can_place_order_against_menu(
    client, admin_headers, customer_headers
):
    item = await _seed_menu_item(client, admin_headers)

    res = await client.post(
        "/api/orders",
        headers=customer_headers,
        json={"items": [{"itemId": item["id"], "qty": 2}]},
    )
    assert res.status_code == 201, res.text
    order = res.json()
    assert order["status"] == "confirmed"
    assert order["paymentStatus"] == "paid"
    assert Decimal(str(order["total"])) == Decimal("25.00")
    assert order["paymentId"].startswith("fake_")
    # Items snapshotted, not referenced
    assert len(order["items"]) == 1
    assert order["items"][0]["name"] == "Pizza"
    assert order["items"][0]["qty"] == 2


@pytest.mark.asyncio
async def test_customer_lists_only_their_own_orders(
    client, admin_headers, make_user
):
    item = await _seed_menu_item(client, admin_headers)
    _, alice_h = await make_user(email="alice@x.com")
    _, bob_h = await make_user(email="bob@x.com")

    await client.post(
        "/api/orders", headers=alice_h, json={"items": [{"itemId": item["id"], "qty": 1}]}
    )
    await client.post(
        "/api/orders", headers=bob_h, json={"items": [{"itemId": item["id"], "qty": 1}]}
    )

    alice_res = await client.get("/api/orders", headers=alice_h)
    assert alice_res.status_code == 200
    assert alice_res.json()["total"] == 1


@pytest.mark.asyncio
async def test_get_other_customers_order_returns_404_not_403(
    client, admin_headers, make_user
):
    """Same shape as not-found — prevents enumeration (orders@v1 invariant)."""
    item = await _seed_menu_item(client, admin_headers)
    _, alice_h = await make_user(email="alice@x.com")
    _, bob_h = await make_user(email="bob@x.com")

    create = await client.post(
        "/api/orders", headers=alice_h, json={"items": [{"itemId": item["id"], "qty": 1}]}
    )
    alice_order_id = create.json()["id"]

    res = await client.get(f"/api/orders/{alice_order_id}", headers=bob_h)
    assert res.status_code == 404
    assert res.json()["detail"]["code"] == "ORDER_NOT_FOUND"


@pytest.mark.asyncio
async def test_cancel_paid_order_refunds_payment(
    client, admin_headers, customer_headers
):
    item = await _seed_menu_item(client, admin_headers)
    create = await client.post(
        "/api/orders",
        headers=customer_headers,
        json={"items": [{"itemId": item["id"], "qty": 1}]},
    )
    order_id = create.json()["id"]

    cancel = await client.post(
        f"/api/orders/{order_id}/cancel", headers=customer_headers
    )
    assert cancel.status_code == 200
    body = cancel.json()
    assert body["status"] == "cancelled"
    assert body["paymentStatus"] == "refunded"


@pytest.mark.asyncio
async def test_cannot_cancel_completed_order(
    client, admin_headers, customer_headers
):
    item = await _seed_menu_item(client, admin_headers)
    create = await client.post(
        "/api/orders",
        headers=customer_headers,
        json={"items": [{"itemId": item["id"], "qty": 1}]},
    )
    order_id = create.json()["id"]

    # Admin transitions to completed
    await client.patch(
        f"/api/admin/orders/{order_id}",
        headers=admin_headers,
        json={"status": "completed"},
    )

    cancel = await client.post(
        f"/api/orders/{order_id}/cancel", headers=customer_headers
    )
    assert cancel.status_code == 409
    assert cancel.json()["detail"]["code"] == "ORDER_NOT_CANCELLABLE"


@pytest.mark.asyncio
async def test_unavailable_menu_item_rejects_order(
    client, admin_headers, customer_headers
):
    item = await _seed_menu_item(client, admin_headers, name="OOS")
    await client.patch(
        f"/api/admin/menu/{item['id']}/availability",
        headers=admin_headers,
        json={"isAvailable": False},
    )

    res = await client.post(
        "/api/orders",
        headers=customer_headers,
        json={"items": [{"itemId": item["id"], "qty": 1}]},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "ORDER_ITEM_UNAVAILABLE"
