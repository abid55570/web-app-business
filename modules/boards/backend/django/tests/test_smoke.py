"""boards Django smoke — owner-only access + card move atomicity.

Pins: only-owner-sees-own-boards, slug uniqueness, status-must-be-in-columns,
move-card updates both status + position in a single round-trip.
"""
import pytest


@pytest.mark.django_db
def test_owner_can_create_and_list_their_board(api_client, customer_headers):
    create = api_client.post(
        "/api/boards",
        {"name": "My board", "slug": "my-board"},
        format="json",
        **customer_headers,
    )
    assert create.status_code == 201, create.content
    listing = api_client.get("/api/boards", **customer_headers)
    assert listing.status_code == 200
    slugs = [b["slug"] for b in listing.json()["items"]]
    assert "my-board" in slugs


@pytest.mark.django_db
def test_other_user_cannot_see_my_board(
    api_client, customer_headers, other_customer_headers
):
    api_client.post(
        "/api/boards",
        {"name": "Private", "slug": "private"},
        format="json",
        **customer_headers,
    )
    listing = api_client.get("/api/boards", **other_customer_headers)
    slugs = [b["slug"] for b in listing.json()["items"]]
    assert "private" not in slugs

    forbidden = api_client.get("/api/boards/private", **other_customer_headers)
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_card_status_must_be_a_column(api_client, customer_headers):
    create = api_client.post(
        "/api/boards",
        {"name": "K", "slug": "k", "columns": ["a", "b"]},
        format="json",
        **customer_headers,
    )
    board_id = create.json()["id"]
    bad = api_client.post(
        f"/api/boards/{board_id}/cards",
        {"title": "Wrong column", "status": "c"},
        format="json",
        **customer_headers,
    )
    assert bad.status_code == 400
    assert bad.json()["code"] == "CARD_STATUS_INVALID"


@pytest.mark.django_db
def test_move_card_updates_status_and_position(api_client, customer_headers):
    board = api_client.post(
        "/api/boards",
        {"name": "B", "slug": "b"},
        format="json",
        **customer_headers,
    ).json()
    card = api_client.post(
        f"/api/boards/{board['id']}/cards",
        {"title": "Task", "status": "todo", "position": 0},
        format="json",
        **customer_headers,
    ).json()

    moved = api_client.patch(
        f"/api/boards/cards/{card['id']}/move",
        {"status": "done", "position": 2},
        format="json",
        **customer_headers,
    )
    assert moved.status_code == 200
    body = moved.json()
    assert body["status"] == "done"
    assert body["position"] == 2


@pytest.mark.django_db
def test_slug_uniqueness_is_enforced(api_client, customer_headers):
    first = api_client.post(
        "/api/boards",
        {"name": "First", "slug": "shared"},
        format="json",
        **customer_headers,
    )
    assert first.status_code == 201
    second = api_client.post(
        "/api/boards",
        {"name": "Second", "slug": "shared"},
        format="json",
        **customer_headers,
    )
    assert second.status_code == 409
    assert second.json()["code"] == "BOARD_SLUG_TAKEN"
