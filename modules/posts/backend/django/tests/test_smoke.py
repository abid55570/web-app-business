"""posts Django smoke — mirrors the FastAPI posts CRUD suite.

Behaviours covered: admin can create draft + publish + list everything;
public list filters to status=published only; admin endpoints reject
non-admin role; slug uniqueness is enforced on create + update.
"""
import pytest


@pytest.mark.django_db
def test_admin_can_create_and_publish_post(api_client, admin_headers):
    create = api_client.post(
        "/api/admin/posts",
        {
            "title": "Hello world",
            "slug": "hello-world",
            "body": "First post body.",
            "status": "draft",
        },
        format="json",
        **admin_headers,
    )
    assert create.status_code == 201
    post_id = create.json()["id"]
    assert create.json()["status"] == "draft"
    assert create.json()["publishedAt"] is None

    publish = api_client.patch(
        f"/api/admin/posts/{post_id}/status",
        {"status": "published"},
        format="json",
        **admin_headers,
    )
    assert publish.status_code == 200
    assert publish.json()["status"] == "published"
    assert publish.json()["publishedAt"] is not None


@pytest.mark.django_db
def test_public_list_filters_to_published(api_client, admin_headers):
    api_client.post(
        "/api/admin/posts",
        {"title": "Public", "slug": "public", "body": "Body.", "status": "published"},
        format="json",
        **admin_headers,
    )
    api_client.post(
        "/api/admin/posts",
        {"title": "Hidden", "slug": "hidden", "body": "Body.", "status": "draft"},
        format="json",
        **admin_headers,
    )

    public = api_client.get("/api/posts")
    assert public.status_code == 200
    slugs = [p["slug"] for p in public.json()["items"]]
    assert "public" in slugs
    assert "hidden" not in slugs


@pytest.mark.django_db
def test_admin_routes_require_admin_role(api_client, customer_headers):
    forbidden = api_client.get("/api/admin/posts", **customer_headers)
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_slug_uniqueness_is_enforced(api_client, admin_headers):
    first = api_client.post(
        "/api/admin/posts",
        {"title": "First", "slug": "shared-slug", "body": "Body."},
        format="json",
        **admin_headers,
    )
    assert first.status_code == 201

    collision = api_client.post(
        "/api/admin/posts",
        {"title": "Second", "slug": "shared-slug", "body": "Body."},
        format="json",
        **admin_headers,
    )
    assert collision.status_code == 409
    assert collision.json()["code"] == "POST_SLUG_TAKEN"
