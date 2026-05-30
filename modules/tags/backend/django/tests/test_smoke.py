"""tags Django smoke — admin CRUD + assign/unassign + tags-for-target lookup."""
import pytest


@pytest.mark.django_db
def test_admin_can_create_and_list_tag(api_client, admin_headers):
    create = api_client.post(
        "/api/admin/tags",
        {"slug": "feature", "label": "Feature", "color": "#22c55e"},
        format="json",
        **admin_headers,
    )
    assert create.status_code == 201
    listing = api_client.get("/api/tags")
    slugs = [t["slug"] for t in listing.json()["items"]]
    assert "feature" in slugs


@pytest.mark.django_db
def test_slug_uniqueness_is_enforced(api_client, admin_headers):
    first = api_client.post(
        "/api/admin/tags",
        {"slug": "shared", "label": "Shared"},
        format="json",
        **admin_headers,
    )
    assert first.status_code == 201
    second = api_client.post(
        "/api/admin/tags",
        {"slug": "shared", "label": "Other"},
        format="json",
        **admin_headers,
    )
    assert second.status_code == 409
    assert second.json()["code"] == "TAG_SLUG_TAKEN"


@pytest.mark.django_db
def test_assign_then_tags_for_target_returns_it(api_client, admin_headers):
    tag = api_client.post(
        "/api/admin/tags",
        {"slug": "news", "label": "News"},
        format="json",
        **admin_headers,
    ).json()
    api_client.post(
        "/api/admin/tags/assign",
        {"tagId": tag["id"], "targetType": "post", "targetId": "p1"},
        format="json",
        **admin_headers,
    )
    listing = api_client.get("/api/tags/for-target?targetType=post&targetId=p1")
    slugs = [t["slug"] for t in listing.json()["tags"]]
    assert slugs == ["news"]


@pytest.mark.django_db
def test_unassign_via_query(api_client, admin_headers):
    tag = api_client.post(
        "/api/admin/tags",
        {"slug": "x", "label": "X"},
        format="json",
        **admin_headers,
    ).json()
    api_client.post(
        "/api/admin/tags/assign",
        {"tagId": tag["id"], "targetType": "post", "targetId": "p2"},
        format="json",
        **admin_headers,
    )
    deleted = api_client.delete(
        f"/api/admin/tags/assign?tagId={tag['id']}&targetType=post&targetId=p2",
        **admin_headers,
    )
    assert deleted.status_code == 204
    listing = api_client.get("/api/tags/for-target?targetType=post&targetId=p2")
    assert listing.json()["tags"] == []


@pytest.mark.django_db
def test_admin_routes_require_admin_role(api_client, customer_headers):
    forbidden = api_client.post(
        "/api/admin/tags",
        {"slug": "no", "label": "No"},
        format="json",
        **customer_headers,
    )
    assert forbidden.status_code == 403
