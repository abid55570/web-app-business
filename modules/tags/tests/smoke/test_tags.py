"""tags@v1 smoke — admin CRUD + polymorphic assign/unassign + lookups."""
import pytest


@pytest.mark.asyncio
async def test_admin_can_create_and_public_lists_it(client, admin_headers):
    create = await client.post(
        "/api/admin/tags",
        headers=admin_headers,
        json={"slug": "feature", "label": "Feature", "color": "#22c55e"},
    )
    assert create.status_code == 201, create.text

    listing = await client.get("/api/tags")
    slugs = [t["slug"] for t in listing.json()["items"]]
    assert "feature" in slugs


@pytest.mark.asyncio
async def test_admin_routes_require_admin(client, customer_headers):
    forbidden = await client.post(
        "/api/admin/tags",
        headers=customer_headers,
        json={"slug": "no", "label": "No"},
    )
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_slug_uniqueness_is_enforced(client, admin_headers):
    first = await client.post(
        "/api/admin/tags",
        headers=admin_headers,
        json={"slug": "shared", "label": "Shared"},
    )
    assert first.status_code == 201
    second = await client.post(
        "/api/admin/tags",
        headers=admin_headers,
        json={"slug": "shared", "label": "Other"},
    )
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "TAG_SLUG_TAKEN"


@pytest.mark.asyncio
async def test_assign_then_lookup_returns_tag(client, admin_headers):
    tag = (
        await client.post(
            "/api/admin/tags",
            headers=admin_headers,
            json={"slug": "news", "label": "News"},
        )
    ).json()
    await client.post(
        "/api/admin/tags/assign",
        headers=admin_headers,
        json={"tagId": tag["id"], "targetType": "post", "targetId": "p1"},
    )

    listing = await client.get("/api/tags/for-target?targetType=post&targetId=p1")
    slugs = [t["slug"] for t in listing.json()["tags"]]
    assert slugs == ["news"]


@pytest.mark.asyncio
async def test_assign_is_idempotent(client, admin_headers):
    tag = (
        await client.post(
            "/api/admin/tags",
            headers=admin_headers,
            json={"slug": "dup", "label": "Dup"},
        )
    ).json()
    for _ in range(3):
        res = await client.post(
            "/api/admin/tags/assign",
            headers=admin_headers,
            json={"tagId": tag["id"], "targetType": "post", "targetId": "p1"},
        )
        assert res.status_code == 201

    listing = await client.get("/api/tags/for-target?targetType=post&targetId=p1")
    assert len(listing.json()["tags"]) == 1


@pytest.mark.asyncio
async def test_unassign_via_query_params(client, admin_headers):
    tag = (
        await client.post(
            "/api/admin/tags",
            headers=admin_headers,
            json={"slug": "x", "label": "X"},
        )
    ).json()
    await client.post(
        "/api/admin/tags/assign",
        headers=admin_headers,
        json={"tagId": tag["id"], "targetType": "post", "targetId": "p2"},
    )

    deleted = await client.delete(
        f"/api/admin/tags/assign?tagId={tag['id']}&targetType=post&targetId=p2",
        headers=admin_headers,
    )
    assert deleted.status_code == 204

    listing = await client.get("/api/tags/for-target?targetType=post&targetId=p2")
    assert listing.json()["tags"] == []


@pytest.mark.asyncio
async def test_targets_for_tag_returns_refs(client, admin_headers):
    tag = (
        await client.post(
            "/api/admin/tags",
            headers=admin_headers,
            json={"slug": "multi", "label": "Multi"},
        )
    ).json()
    for tid in ["a", "b", "c"]:
        await client.post(
            "/api/admin/tags/assign",
            headers=admin_headers,
            json={"tagId": tag["id"], "targetType": "post", "targetId": tid},
        )

    res = await client.get(f"/api/tags/{tag['id']}/targets?targetType=post")
    ids = sorted(t["targetId"] for t in res.json()["targets"])
    assert ids == ["a", "b", "c"]
