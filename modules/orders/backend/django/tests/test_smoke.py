"""orders Django smoke — full create → cancel flow with payment + events.

Mirrors the FastAPI orders/test_orders_flow.py suite.
"""
from decimal import Decimal

import pytest


def _seed_menu_item(api_client, admin_headers, name="Pizza", price="12.50"):
    res = api_client.post(
        "/api/admin/menu",
        {"name": name, "price": price, "currency": "USD", "category": "pizza"},
        format="json",
        **admin_headers,
    )
    assert res.status_code == 201
    return res.json()


@pytest.mark.django_db
def test_customer_can_place_order_against_menu(
    api_client, admin_headers, customer_headers
):
    item = _seed_menu_item(api_client, admin_headers)

    res = api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 2}]},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 201, res.content
    order = res.json()
    assert order["status"] == "confirmed"
    assert order["paymentStatus"] == "paid"
    assert Decimal(str(order["total"])) == Decimal("25.00")
    assert order["paymentId"].startswith("fake_")
    assert len(order["items"]) == 1
    assert order["items"][0]["name"] == "Pizza"
    assert order["items"][0]["qty"] == 2


@pytest.mark.django_db
def test_customer_lists_only_their_own_orders(
    api_client, admin_headers, make_user
):
    item = _seed_menu_item(api_client, admin_headers)
    _, alice_h = make_user(email="alice@x.com")
    _, bob_h = make_user(email="bob@x.com")

    api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **alice_h,
    )
    api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **bob_h,
    )

    alice_res = api_client.get("/api/orders/list", **alice_h)
    assert alice_res.status_code == 200
    assert alice_res.json()["total"] == 1


@pytest.mark.django_db
def test_get_other_customers_order_returns_404_not_403(
    api_client, admin_headers, make_user
):
    """Same shape as not-found — prevents enumeration (orders@v1 invariant)."""
    item = _seed_menu_item(api_client, admin_headers)
    _, alice_h = make_user(email="alice@x.com")
    _, bob_h = make_user(email="bob@x.com")

    create = api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **alice_h,
    )
    alice_order_id = create.json()["id"]

    res = api_client.get(f"/api/orders/{alice_order_id}", **bob_h)
    assert res.status_code == 404
    assert res.json()["code"] == "ORDER_NOT_FOUND"


@pytest.mark.django_db
def test_cancel_paid_order_refunds_payment(
    api_client, admin_headers, customer_headers
):
    item = _seed_menu_item(api_client, admin_headers)
    create = api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **customer_headers,
    )
    order_id = create.json()["id"]

    cancel = api_client.post(
        f"/api/orders/{order_id}/cancel", **customer_headers
    )
    assert cancel.status_code == 200
    body = cancel.json()
    assert body["status"] == "cancelled"
    assert body["paymentStatus"] == "refunded"


@pytest.mark.django_db
def test_cannot_cancel_completed_order(
    api_client, admin_headers, customer_headers
):
    item = _seed_menu_item(api_client, admin_headers)
    create = api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **customer_headers,
    )
    order_id = create.json()["id"]

    api_client.patch(
        f"/api/admin/orders/{order_id}",
        {"status": "completed"},
        format="json",
        **admin_headers,
    )

    cancel = api_client.post(
        f"/api/orders/{order_id}/cancel", **customer_headers
    )
    assert cancel.status_code == 409
    assert cancel.json()["code"] == "ORDER_NOT_CANCELLABLE"


@pytest.mark.django_db
def test_unavailable_menu_item_rejects_order(
    api_client, admin_headers, customer_headers
):
    item = _seed_menu_item(api_client, admin_headers, name="OOS")
    api_client.patch(
        f"/api/admin/menu/{item['id']}/availability",
        {"isAvailable": False},
        format="json",
        **admin_headers,
    )

    res = api_client.post(
        "/api/orders",
        {"items": [{"itemId": item["id"], "qty": 1}]},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 400
    assert res.json()["code"] == "ORDER_ITEM_UNAVAILABLE"
