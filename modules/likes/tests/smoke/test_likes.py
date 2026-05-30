"""likes@v1 smoke — toggle, count, anon-read, my-likes."""
import pytest


@pytest.mark.asyncio
async def test_first_post_likes_second_unlikes(client, customer_headers):
    a = await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1"},
    )
    assert a.status_code == 200
    assert a.json()["liked"] is True
    assert a.json()["count"] == 1

    b = await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1"},
    )
    assert b.status_code == 200
    assert b.json()["liked"] is False
    assert b.json()["count"] == 0


@pytest.mark.asyncio
async def test_anon_for_target_returns_count_only(client, customer_headers):
    await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p2"},
    )
    res = await client.get(
        "/api/likes/for-target?targetType=post&targetId=p2"
    )
    assert res.status_code == 200
    body = res.json()
    assert body["count"] == 1
    assert body["likedByMe"] is False


@pytest.mark.asyncio
async def test_authed_for_target_returns_likedByMe(client, customer_headers):
    await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p3"},
    )
    res = await client.get(
        "/api/likes/for-target?targetType=post&targetId=p3",
        headers=customer_headers,
    )
    assert res.json()["likedByMe"] is True


@pytest.mark.asyncio
async def test_anonymous_cannot_toggle(client):
    res = await client.post(
        "/api/likes",
        json={"targetType": "post", "targetId": "p1"},
    )
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_two_users_count_independently(
    client, customer_headers, other_customer_headers
):
    await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "shared"},
    )
    await client.post(
        "/api/likes",
        headers=other_customer_headers,
        json={"targetType": "post", "targetId": "shared"},
    )
    res = await client.get(
        "/api/likes/for-target?targetType=post&targetId=shared"
    )
    assert res.json()["count"] == 2


@pytest.mark.asyncio
async def test_my_likes_filters_by_targetType(client, customer_headers):
    await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1"},
    )
    await client.post(
        "/api/likes",
        headers=customer_headers,
        json={"targetType": "comment", "targetId": "c1"},
    )

    only_posts = await client.get(
        "/api/likes/my?targetType=post", headers=customer_headers
    )
    types = {l["targetType"] for l in only_posts.json()["items"]}
    assert types == {"post"}

    everything = await client.get("/api/likes/my", headers=customer_headers)
    assert everything.json()["total"] == 2
