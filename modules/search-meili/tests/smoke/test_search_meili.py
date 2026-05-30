"""search-meili@v1 smoke — admin index/delete, public search."""
import pytest


@pytest.mark.asyncio
async def test_admin_indexes_then_public_searches(client, admin_headers):
    await client.post(
        "/api/admin/search/index",
        headers=admin_headers,
        json={
            "index": "posts",
            "documentId": "p-1",
            "document": {"title": "Hello world", "slug": "hello-world"},
        },
    )
    res = await client.get("/api/search/posts?q=hello")
    body = res.json()
    assert body["total"] == 1
    assert body["hits"][0]["id"] == "p-1"


@pytest.mark.asyncio
async def test_admin_delete_removes_doc(client, admin_headers):
    await client.post(
        "/api/admin/search/index",
        headers=admin_headers,
        json={
            "index": "posts",
            "documentId": "p-2",
            "document": {"title": "delete me", "slug": "delete-me"},
        },
    )
    deleted = await client.request(
        "DELETE",
        "/api/admin/search/index",
        headers=admin_headers,
        json={"index": "posts", "documentId": "p-2"},
    )
    assert deleted.status_code == 204
    res = await client.get("/api/search/posts?q=delete")
    assert res.json()["total"] == 0


@pytest.mark.asyncio
async def test_search_empty_query_lists_all(client, admin_headers):
    for i in range(3):
        await client.post(
            "/api/admin/search/index",
            headers=admin_headers,
            json={
                "index": "items",
                "documentId": f"i-{i}",
                "document": {"name": f"item {i}"},
            },
        )
    res = await client.get("/api/search/items?q=")
    assert res.json()["total"] == 3


@pytest.mark.asyncio
async def test_admin_routes_require_admin(client, customer_headers):
    forbidden = await client.post(
        "/api/admin/search/index",
        headers=customer_headers,
        json={
            "index": "posts",
            "documentId": "p-x",
            "document": {"title": "x"},
        },
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_admin_stats_returns_host(client, admin_headers):
    res = await client.get("/api/admin/search/stats", headers=admin_headers)
    assert res.status_code == 200
    body = res.json()
    assert "host" in body
    assert "indexes" in body
