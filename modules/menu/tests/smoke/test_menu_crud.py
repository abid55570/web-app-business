"""menu@v1 smoke — admin CRUD + public list filtering.

Covers the dual-router contract: public endpoints filter to
``is_available=true``; admin endpoints see everything and can mutate.
"""
import pytest


@pytest.mark.asyncio
async def test_admin_can_create_and_list_menu_item(client, admin_headers):
    create_res = await client.post(
        "/api/admin/menu",
        headers=admin_headers,
        json={
            "name": "Margherita",
            "description": "Classic tomato + mozzarella",
            "price": "12.50",
            "currency": "USD",
            "category": "pizza",
        },
    )
    assert create_res.status_code == 201, create_res.text
    item = create_res.json()
    assert item["name"] == "Margherita"
    assert item["isAvailable"] is True

    list_res = await client.get("/api/admin/menu", headers=admin_headers)
    assert list_res.status_code == 200
    assert list_res.json()["total"] == 1


@pytest.mark.asyncio
async def test_public_list_hides_unavailable_items(
    client, admin_headers
):
    await client.post(
        "/api/admin/menu",
        headers=admin_headers,
        json={"name": "Visible", "price": "5.00", "category": "starter"},
    )
    hidden = await client.post(
        "/api/admin/menu",
        headers=admin_headers,
        json={"name": "Hidden", "price": "5.00", "category": "starter"},
    )
    hidden_id = hidden.json()["id"]
    await client.patch(
        f"/api/admin/menu/{hidden_id}/availability",
        headers=admin_headers,
        json={"isAvailable": False},
    )

    public_res = await client.get("/api/menu")
    assert public_res.status_code == 200
    names = [it["name"] for it in public_res.json()["items"]]
    assert names == ["Visible"]

    admin_res = await client.get("/api/admin/menu", headers=admin_headers)
    admin_names = sorted(it["name"] for it in admin_res.json()["items"])
    assert admin_names == ["Hidden", "Visible"]


@pytest.mark.asyncio
async def test_admin_endpoints_require_admin_role(client, customer_headers):
    res = await client.post(
        "/api/admin/menu",
        headers=customer_headers,
        json={"name": "Forbidden", "price": "1.00", "category": "x"},
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_admin_can_update_and_delete(client, admin_headers):
    create_res = await client.post(
        "/api/admin/menu",
        headers=admin_headers,
        json={"name": "Old name", "price": "1.00", "category": "x"},
    )
    item_id = create_res.json()["id"]

    upd_res = await client.patch(
        f"/api/admin/menu/{item_id}",
        headers=admin_headers,
        json={"name": "New name", "price": "2.50"},
    )
    assert upd_res.status_code == 200
    body = upd_res.json()
    assert body["name"] == "New name"
    assert float(body["price"]) == 2.50

    del_res = await client.delete(
        f"/api/admin/menu/{item_id}", headers=admin_headers
    )
    assert del_res.status_code == 204

    after = await client.get("/api/admin/menu", headers=admin_headers)
    assert after.json()["total"] == 0
