"""bookmarks@v1 smoke — idempotent save + check + my-filter + private-to-user."""
import pytest


@pytest.mark.asyncio
async def test_save_then_check_returns_true(client, customer_headers):
    saved = await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1"},
    )
    assert saved.status_code == 201

    check = await client.get(
        "/api/bookmarks/check?targetType=post&targetId=p1",
        headers=customer_headers,
    )
    assert check.json()["bookmarked"] is True


@pytest.mark.asyncio
async def test_save_is_idempotent_and_updates_note(client, customer_headers):
    first = await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1", "note": "first"},
    )
    assert first.status_code == 201

    second = await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1", "note": "updated"},
    )
    # idempotent — same row, note refreshed (201 again since the model just
    # re-validates and returns the up-to-date row)
    assert second.status_code in {200, 201}
    assert second.json()["note"] == "updated"


@pytest.mark.asyncio
async def test_remove_then_check_returns_false(client, customer_headers):
    await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p2"},
    )
    await client.delete(
        "/api/bookmarks?targetType=post&targetId=p2",
        headers=customer_headers,
    )

    check = await client.get(
        "/api/bookmarks/check?targetType=post&targetId=p2",
        headers=customer_headers,
    )
    assert check.json()["bookmarked"] is False


@pytest.mark.asyncio
async def test_my_is_private_to_user(
    client, customer_headers, other_customer_headers
):
    await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "mine"},
    )
    await client.post(
        "/api/bookmarks",
        headers=other_customer_headers,
        json={"targetType": "post", "targetId": "theirs"},
    )

    mine = await client.get("/api/bookmarks/my", headers=customer_headers)
    ids = [b["targetId"] for b in mine.json()["items"]]
    assert ids == ["mine"]


@pytest.mark.asyncio
async def test_anonymous_is_refused(client):
    res = await client.post(
        "/api/bookmarks",
        json={"targetType": "post", "targetId": "p1"},
    )
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_my_filters_by_targetType(client, customer_headers):
    await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1"},
    )
    await client.post(
        "/api/bookmarks",
        headers=customer_headers,
        json={"targetType": "article", "targetId": "a1"},
    )

    only_posts = await client.get(
        "/api/bookmarks/my?targetType=post", headers=customer_headers
    )
    types = {b["targetType"] for b in only_posts.json()["items"]}
    assert types == {"post"}
