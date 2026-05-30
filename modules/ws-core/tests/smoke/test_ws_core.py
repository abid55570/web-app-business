"""ws-core@v1 smoke — connection handshake, broadcast, admin rooms.

Uses the TestClient's `websocket_connect` context manager so the asyncio
loop is owned by the test client, not pytest-asyncio.
"""
import pytest
from fastapi.testclient import TestClient

# Tests use the sync TestClient pattern — pytest-asyncio not required for
# websocket assertions. The generated `app/conftest.py` provides `app_sync`
# (TestClient) alongside the async `client` fixture.


def test_ws_rejects_invalid_token(app_sync: TestClient):
    with pytest.raises(Exception):
        with app_sync.websocket_connect("/api/ws/lobby?token=garbage"):
            pass


def test_ws_accepts_valid_token_and_echoes(
    app_sync: TestClient, customer_token: str
):
    with app_sync.websocket_connect(
        f"/api/ws/lobby?token={customer_token}"
    ) as ws:
        ws.send_json({"hello": "world"})
        echo = ws.receive_json()
        assert echo["type"] == "message"
        assert echo["payload"] == {"hello": "world"}


def test_http_broadcast_reaches_subscribers(
    app_sync: TestClient, customer_token: str, customer_headers: dict
):
    with app_sync.websocket_connect(
        f"/api/ws/announcements?token={customer_token}"
    ) as ws:
        res = app_sync.post(
            "/api/ws/broadcast",
            headers=customer_headers,
            json={"room": "announcements", "message": {"kind": "release", "v": "1.4"}},
        )
        assert res.status_code == 200
        assert res.json()["recipients"] == 1

        msg = ws.receive_json()
        assert msg["kind"] == "release"
        assert msg["v"] == "1.4"


def test_admin_rooms_lists_active_rooms(
    app_sync: TestClient, customer_token: str, admin_headers: dict
):
    with app_sync.websocket_connect(
        f"/api/ws/active?token={customer_token}"
    ):
        res = app_sync.get("/api/ws/rooms", headers=admin_headers)
        assert res.status_code == 200
        rooms = {r["room"]: r["connections"] for r in res.json()["items"]}
        assert rooms.get("active") == 1


def test_admin_rooms_requires_admin(app_sync: TestClient, customer_headers: dict):
    res = app_sync.get("/api/ws/rooms", headers=customer_headers)
    assert res.status_code == 403
