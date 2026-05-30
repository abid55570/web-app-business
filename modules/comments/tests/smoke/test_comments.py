"""comments@v1 smoke — author-self workflow + admin moderation.

Pins the public/admin split: anyone reads visible comments; only signed-in
users post; only the author edits or deletes; admins see everything and
moderate via status transitions.
"""
import pytest


@pytest.mark.asyncio
async def test_authed_user_can_create_visible_comment(client, customer_headers):
    res = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p1", "body": "First!"},
    )
    assert res.status_code == 201, res.text
    body = res.json()
    assert body["status"] == "visible"
    assert body["targetType"] == "post"
    assert body["authorId"]


@pytest.mark.asyncio
async def test_anonymous_cannot_create(client):
    res = await client.post(
        "/api/comments",
        json={"targetType": "post", "targetId": "p1", "body": "Hi"},
    )
    assert res.status_code in {401, 403}


@pytest.mark.asyncio
async def test_public_list_returns_only_visible(
    client, admin_headers, customer_headers
):
    a = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p2", "body": "Visible"},
    )
    b = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p2", "body": "Will be hidden"},
    )
    await client.patch(
        f"/api/admin/comments/{b.json()['id']}/status",
        headers=admin_headers,
        json={"status": "hidden"},
    )

    listing = await client.get(
        "/api/comments?targetType=post&targetId=p2",
    )
    assert listing.status_code == 200
    bodies = [c["body"] for c in listing.json()["items"]]
    assert "Visible" in bodies
    assert "Will be hidden" not in bodies


@pytest.mark.asyncio
async def test_only_author_can_edit(
    client, customer_headers, other_customer_headers
):
    created = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p3", "body": "Mine"},
    )
    cid = created.json()["id"]

    forbidden = await client.patch(
        f"/api/comments/{cid}",
        headers=other_customer_headers,
        json={"body": "Hacked"},
    )
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_admin_moderation_hides_comment(
    client, admin_headers, customer_headers
):
    created = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p4", "body": "Spam"},
    )
    cid = created.json()["id"]

    hidden = await client.patch(
        f"/api/admin/comments/{cid}/status",
        headers=admin_headers,
        json={"status": "hidden"},
    )
    assert hidden.status_code == 200
    assert hidden.json()["status"] == "hidden"

    after = await client.get(
        "/api/comments?targetType=post&targetId=p4",
    )
    assert after.json()["total"] == 0


@pytest.mark.asyncio
async def test_parent_target_mismatch_rejected(client, customer_headers):
    a = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={"targetType": "post", "targetId": "p5", "body": "Root"},
    )
    parent_id = a.json()["id"]

    cross = await client.post(
        "/api/comments",
        headers=customer_headers,
        json={
            "targetType": "post",
            "targetId": "different",
            "parentId": parent_id,
            "body": "Out of scope",
        },
    )
    assert cross.status_code == 400
    assert cross.json()["detail"]["code"] == "COMMENT_PARENT_MISMATCH"
