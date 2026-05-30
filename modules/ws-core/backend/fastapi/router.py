"""FastAPI routes implementing ws-core@v1.

Single router (mixed HTTP + WebSocket) mounted at /api.

  WS    /ws/{room}?token=<jwt>     → join a room. Token is the same JWT
                                     used by HTTP routes (validates via
                                     auth_core.utils.decode_session_token).
  POST  /api/ws/broadcast          → push a message to every conn in a
                                     room (HTTP, auth required).
  GET   /api/ws/rooms              → admin debug — current rooms + counts.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, WebSocket, WebSocketDisconnect, status
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.auth_core.model import User
from app.auth_core.utils import decode_session_token
from app.database import get_db
from app.events_bus.bus import bus
from app.ws_core.registry import registry


router = APIRouter()


# ---- WS ----


@router.websocket("/ws/{room}")
async def ws_endpoint(
    websocket: WebSocket,
    room: str,
    token: Annotated[str, Query()],
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    # Authenticate before accepting; failure closes the handshake.
    user_id = decode_session_token(token)
    if user_id is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    await websocket.accept()
    conn = await registry.add(room, websocket, user.id)
    await bus.emit("ws.connected", {"room": room, "userId": user.id})
    try:
        while True:
            # Echo client messages into the room so chat-style apps work
            # out of the box. Custom servers can pull this loop apart and
            # route incoming JSON however they want.
            try:
                payload = await websocket.receive_json()
            except WebSocketDisconnect:
                break
            await registry.broadcast(
                room,
                {"type": "message", "from": user.id, "payload": payload},
            )
    finally:
        await registry.remove(room, conn)
        await bus.emit("ws.disconnected", {"room": room, "userId": user.id})


# ---- HTTP ----


class BroadcastBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    room: str = Field(min_length=1, max_length=128)
    message: dict


class BroadcastResponse(BaseModel):
    room: str
    recipients: int


@router.post(
    "/ws/broadcast",
    response_model=BroadcastResponse,
    status_code=status.HTTP_200_OK,
)
async def broadcast(
    body: BroadcastBody,
    _: CurrentUser,
) -> BroadcastResponse:
    """Push a message into a room from server code or another module.

    Any signed-in user can broadcast in v1 — pinning this to admin only is
    a one-line change (`_: CurrentAdmin`) if the deployment needs it.
    """
    sent = await registry.broadcast(body.room, body.message)
    await bus.emit("ws.broadcast", {"room": body.room, "recipients": sent})
    return BroadcastResponse(room=body.room, recipients=sent)


class RoomStats(BaseModel):
    room: str
    connections: int


class RoomsResponse(BaseModel):
    items: list[RoomStats]
    total: int


@router.get(
    "/ws/rooms",
    response_model=RoomsResponse,
    response_model_by_alias=True,
)
async def list_rooms(_: CurrentAdmin) -> RoomsResponse:
    """Admin-only: current rooms + conn counts. Useful for ops dashboards."""
    rooms = list(registry.list_rooms())
    items = [RoomStats(room=r, connections=registry.conn_count(r)) for r in rooms]
    return RoomsResponse(items=items, total=len(items))
