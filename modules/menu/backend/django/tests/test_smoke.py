"""menu Django smoke — mirrors the FastAPI menu CRUD suite.

Same 4 behaviours: admin can create + list, public list filters to
is_available=true, admin endpoints reject non-admin role, admin can
update + delete.
"""
import pytest


@pytest.mark.django_db
def test_admin_can_create_and_list_menu_item(api_client, admin_headers):
    create = api_client.post(
        "/api/admin/menu",
        {
            "name": "Margherita",
            "description": "Classic tomato + mozzarella",
            "price": "12.50",
            "currency": "USD",
            "category": "pizza",
        },
        format="json",
        **admin_headers,
    )
    assert create.status_code == 201, create.content
    assert create.json()["name"] == "Margherita"
    assert create.json()["isAvailable"] is True

    listing = api_client.get("/api/admin/menu", **admin_headers)
    assert listing.status_code == 200
    assert listing.json()["total"] == 1


@pytest.mark.django_db
def test_public_list_hides_unavailable_items(api_client, admin_headers):
    api_client.post(
        "/api/admin/menu",
        {"name": "Visible", "price": "5.00", "category": "starter"},
        format="json",
        **admin_headers,
    )
    hidden = api_client.post(
        "/api/admin/menu",
        {"name": "Hidden", "price": "5.00", "category": "starter"},
        format="json",
        **admin_headers,
    )
    hidden_id = hidden.json()["id"]
    api_client.patch(
        f"/api/admin/menu/{hidden_id}/availability",
        {"isAvailable": False},
        format="json",
        **admin_headers,
    )

    public = api_client.get("/api/menu")
    assert public.status_code == 200
    names = [it["name"] for it in public.json()["items"]]
    assert names == ["Visible"]

    admin = api_client.get("/api/admin/menu", **admin_headers)
    assert sorted(it["name"] for it in admin.json()["items"]) == [
        "Hidden",
        "Visible",
    ]


@pytest.mark.django_db
def test_admin_endpoints_require_admin_role(api_client, customer_headers):
    res = api_client.post(
        "/api/admin/menu",
        {"name": "Forbidden", "price": "1.00", "category": "x"},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 403
    assert res.json()["code"] == "AUTH_FORBIDDEN"


@pytest.mark.django_db
def test_admin_can_update_and_delete(api_client, admin_headers):
    create = api_client.post(
        "/api/admin/menu",
        {"name": "Old name", "price": "1.00", "category": "x"},
        format="json",
        **admin_headers,
    )
    item_id = create.json()["id"]

    upd = api_client.patch(
        f"/api/admin/menu/{item_id}",
        {"name": "New name", "price": "2.50"},
        format="json",
        **admin_headers,
    )
    assert upd.status_code == 200
    assert upd.json()["name"] == "New name"
    assert float(upd.json()["price"]) == 2.50

    del_ = api_client.delete(f"/api/admin/menu/{item_id}", **admin_headers)
    assert del_.status_code == 204

    after = api_client.get("/api/admin/menu", **admin_headers)
    assert after.json()["total"] == 0
