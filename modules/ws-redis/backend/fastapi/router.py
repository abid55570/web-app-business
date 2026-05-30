"""HTTP-only router for ws-redis.

ws-redis ships with ONE HTTP endpoint — admin debug for redis channel
state. The WebSocket endpoint stays in ws-core (clients still connect
to `/api/ws/{room}`); ws-redis only swaps the registry behind it.

Wiring in app.main when both modules are present:

    from app.ws_redis.registry import registry as ws_registry
    import app.ws_core.router as ws_core_router
    ws_core_router.registry = ws_registry  # replace the local registry
"""
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.auth_core.dependencies import CurrentAdmin
from app.ws_redis.registry import registry


router = APIRouter()


class RedisRoomStats(BaseModel):
    room: str
    local_connections: int
    subscribed: bool


class RedisRoomsResponse(BaseModel):
    items: list[RedisRoomStats]
    total: int
    redis_url: str


@router.get("/ws-redis/rooms", response_model=RedisRoomsResponse)
async def list_redis_rooms(_: CurrentAdmin) -> RedisRoomsResponse:
    rooms = registry.list_rooms()
    items = [
        RedisRoomStats(
            room=r,
            local_connections=registry.conn_count(r),
            subscribed=r in registry._subscribed_rooms,
        )
        for r in rooms
    ]
    return RedisRoomsResponse(
        items=items, total=len(items), redis_url=registry.redis_url
    )
