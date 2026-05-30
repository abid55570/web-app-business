"""boards@v1 smoke — owner-only access, card move atomicity, slug uniqueness."""
import pytest


@pytest.mark.asyncio
async def test_owner_can_create_and_list_their_board(client, customer_headers):
    create = await client.post(
        "/api/boards",
        headers=customer_headers,
        json={"name": "My board", "slug": "my-board"},
    )
    assert create.status_code == 201, create.text

    listing = await client.get("/api/boards", headers=customer_headers)
    assert listing.status_code == 200
    slugs = [b["slug"] for b in listing.json()["items"]]
    assert "my-board" in slugs


@pytest.mark.asyncio
async def test_other_user_cannot_see_my_board(
    client, customer_headers, other_customer_headers
):
    await client.post(
        "/api/boards",
        headers=customer_headers,
        json={"name": "Private", "slug": "private"},
    )

    listing = await client.get("/api/boards", headers=other_customer_headers)
    slugs = [b["slug"] for b in listing.json()["items"]]
    assert "private" not in slugs

    forbidden = await client.get(
        "/api/boards/private", headers=other_customer_headers
    )
    assert forbidden.status_code == 403
    assert forbidden.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_card_status_must_be_a_board_column(client, customer_headers):
    create = await client.post(
        "/api/boards",
        headers=customer_headers,
        json={"name": "K", "slug": "k", "columns": ["a", "b"]},
    )
    board_id = create.json()["id"]

    bad = await client.post(
        f"/api/boards/{board_id}/cards",
        headers=customer_headers,
        json={"title": "Wrong column", "status": "c"},
    )
    assert bad.status_code == 400
    assert bad.json()["detail"]["code"] == "CARD_STATUS_INVALID"


@pytest.mark.asyncio
async def test_move_card_updates_status_and_position(client, customer_headers):
    board = (
        await client.post(
            "/api/boards",
            headers=customer_headers,
            json={"name": "B", "slug": "b"},
        )
    ).json()
    card = (
        await client.post(
            f"/api/boards/{board['id']}/cards",
            headers=customer_headers,
            json={"title": "Task", "status": "todo", "position": 0},
        )
    ).json()

    moved = await client.patch(
        f"/api/boards/cards/{card['id']}/move",
        headers=customer_headers,
        json={"status": "done", "position": 2},
    )
    assert moved.status_code == 200
    body = moved.json()
    assert body["status"] == "done"
    assert body["position"] == 2


@pytest.mark.asyncio
async def test_slug_uniqueness_is_enforced(client, customer_headers):
    first = await client.post(
        "/api/boards",
        headers=customer_headers,
        json={"name": "First", "slug": "shared"},
    )
    assert first.status_code == 201

    second = await client.post(
        "/api/boards",
        headers=customer_headers,
        json={"name": "Second", "slug": "shared"},
    )
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "BOARD_SLUG_TAKEN"
