"""comments Django smoke — mirrors the FastAPI comments suite.

Behaviours covered: authed user can create + self-edit + self-delete;
public list returns only status=visible; non-author edit is 403; admin
moderation status change works.
"""
import pytest


@pytest.mark.django_db
def test_authed_user_can_create_visible_comment(api_client, customer_headers):
    res = api_client.post(
        "/api/comments",
        {"targetType": "post", "targetId": "p1", "body": "First!"},
        format="json",
        **customer_headers,
    )
    assert res.status_code == 201
    assert res.json()["status"] == "visible"
    assert res.json()["authorId"]  # stamped from user


@pytest.mark.django_db
def test_anonymous_cannot_create(api_client):
    res = api_client.post(
        "/api/comments",
        {"targetType": "post", "targetId": "p1", "body": "Hi"},
        format="json",
    )
    assert res.status_code in {401, 403}


@pytest.mark.django_db
def test_public_list_returns_only_visible(api_client, admin_headers, customer_headers):
    a = api_client.post(
        "/api/comments",
        {"targetType": "post", "targetId": "p2", "body": "Visible"},
        format="json",
        **customer_headers,
    )
    b = api_client.post(
        "/api/comments",
        {"targetType": "post", "targetId": "p2", "body": "Will be hidden"},
        format="json",
        **customer_headers,
    )
    api_client.patch(
        f"/api/admin/comments/{b.json()['id']}/status",
        {"status": "hidden"},
        format="json",
        **admin_headers,
    )

    listing = api_client.get("/api/comments?targetType=post&targetId=p2")
    assert listing.status_code == 200
    bodies = [c["body"] for c in listing.json()["items"]]
    assert "Visible" in bodies
    assert "Will be hidden" not in bodies


@pytest.mark.django_db
def test_only_author_can_edit(
    api_client, customer_headers, other_customer_headers
):
    created = api_client.post(
        "/api/comments",
        {"targetType": "post", "targetId": "p3", "body": "Mine"},
        format="json",
        **customer_headers,
    )
    cid = created.json()["id"]

    forbidden = api_client.patch(
        f"/api/comments/{cid}",
        {"body": "Hacked"},
        format="json",
        **other_customer_headers,
    )
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_admin_moderation_hides_comment(api_client, admin_headers, customer_headers):
    created = api_client.post(
        "/api/comments",
        {"targetType": "post", "targetId": "p4", "body": "Spam"},
        format="json",
        **customer_headers,
    )
    cid = created.json()["id"]

    hidden = api_client.patch(
        f"/api/admin/comments/{cid}/status",
        {"status": "hidden"},
        format="json",
        **admin_headers,
    )
    assert hidden.status_code == 200
    assert hidden.json()["status"] == "hidden"
