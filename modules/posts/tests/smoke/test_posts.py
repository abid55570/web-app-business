"""posts@v1 smoke — admin CRUD + status transitions + public filtering.

Covers the dual-router contract: public endpoints filter to
``status=published``; admin endpoints see everything and can mutate.
Also pins slug uniqueness + publish-stamps-publishedAt-once invariants.
"""
import pytest


@pytest.mark.asyncio
async def test_admin_can_create_draft_and_publish(client, admin_headers):
    create_res = await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={
            "title": "Hello world",
            "slug": "hello-world",
            "body": "First post body.",
            "status": "draft",
        },
    )
    assert create_res.status_code == 201, create_res.text
    post = create_res.json()
    assert post["status"] == "draft"
    assert post["publishedAt"] is None
    post_id = post["id"]

    publish_res = await client.patch(
        f"/api/admin/posts/{post_id}/status",
        headers=admin_headers,
        json={"status": "published"},
    )
    assert publish_res.status_code == 200
    published = publish_res.json()
    assert published["status"] == "published"
    assert published["publishedAt"] is not None


@pytest.mark.asyncio
async def test_public_list_filters_to_published_only(client, admin_headers):
    await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={
            "title": "Public",
            "slug": "public",
            "body": "Visible body.",
            "status": "published",
        },
    )
    await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={
            "title": "Hidden",
            "slug": "hidden",
            "body": "Hidden body.",
            "status": "draft",
        },
    )

    public_res = await client.get("/api/posts")
    assert public_res.status_code == 200
    slugs = [p["slug"] for p in public_res.json()["items"]]
    assert "public" in slugs
    assert "hidden" not in slugs


@pytest.mark.asyncio
async def test_public_get_by_slug_404s_on_draft(client, admin_headers):
    await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={"title": "Draft", "slug": "draft-only", "body": "Body.", "status": "draft"},
    )
    res = await client.get("/api/posts/draft-only")
    assert res.status_code == 404
    assert res.json()["detail"]["code"] == "POST_NOT_FOUND"


@pytest.mark.asyncio
async def test_admin_endpoints_require_admin_role(client, customer_headers):
    res = await client.post(
        "/api/admin/posts",
        headers=customer_headers,
        json={"title": "Forbidden", "slug": "no", "body": "Body."},
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_slug_uniqueness_is_enforced_on_create_and_update(
    client, admin_headers
):
    first = await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={"title": "First", "slug": "shared-slug", "body": "Body."},
    )
    assert first.status_code == 201

    collision = await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={"title": "Second", "slug": "shared-slug", "body": "Body."},
    )
    assert collision.status_code == 409
    assert collision.json()["detail"]["code"] == "POST_SLUG_TAKEN"

    second = await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={"title": "Second", "slug": "other-slug", "body": "Body."},
    )
    second_id = second.json()["id"]

    rename_collision = await client.patch(
        f"/api/admin/posts/{second_id}",
        headers=admin_headers,
        json={"slug": "shared-slug"},
    )
    assert rename_collision.status_code == 409


@pytest.mark.asyncio
async def test_publish_stamps_published_at_only_on_first_transition(
    client, admin_headers
):
    create_res = await client.post(
        "/api/admin/posts",
        headers=admin_headers,
        json={
            "title": "Cycle",
            "slug": "cycle",
            "body": "Body.",
            "status": "published",
        },
    )
    post = create_res.json()
    first_published_at = post["publishedAt"]
    assert first_published_at is not None
    post_id = post["id"]

    # archive → republish should NOT reset publishedAt
    await client.patch(
        f"/api/admin/posts/{post_id}/status",
        headers=admin_headers,
        json={"status": "archived"},
    )
    re_publish = await client.patch(
        f"/api/admin/posts/{post_id}/status",
        headers=admin_headers,
        json={"status": "published"},
    )
    assert re_publish.status_code == 200
    assert re_publish.json()["publishedAt"] == first_published_at
