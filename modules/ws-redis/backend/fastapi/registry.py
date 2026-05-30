"""Redis-backed pub/sub registry — multi-pod variant of ws-core's local registry.

Same public surface (`add`, `remove`, `broadcast`, `list_rooms`,
`conn_count`) so callers don't need to know whether they're talking to
the local or redis variant. Pick the variant at app boot via dependency
injection (see `app.main` wiring).

When a broadcast comes in:

1. Locally → fan out to local sockets immediately (low latency).
2. Also → PUBLISH on `<prefix>:<room>` so other pods deliver to their
   local subscribers.

When a SUBSCRIBE message lands on `<prefix>:<room>` we fan out to
locally-connected sockets ONLY (not back to the channel) so we don't
fan-out-loop.
"""
from __future__ import annotations

import asyncio
import json
import logging
import os
from dataclasses import dataclass, field

import redis.asyncio as redis
from fastapi import WebSocket


logger = logging.getLogger(__name__)


DEFAULT_REDIS_URL = "redis://localhost:6379/0"
DEFAULT_CHANNEL_PREFIX = "ws"


@dataclass
class _Conn:
    ws: WebSocket
    user_id: str


@dataclass
class _Registry:
    redis_url: str = field(default_factory=lambda: os.getenv("REDIS_URL", DEFAULT_REDIS_URL))
    channel_prefix: str = DEFAULT_CHANNEL_PREFIX
    rooms: dict[str, set[_Conn]] = field(default_factory=dict)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)
    _redis: redis.Redis | None = None
    _pubsub: redis.client.PubSub | None = None
    _listener_task: asyncio.Task | None = None
    _subscribed_rooms: set[str] = field(default_factory=set)

    def _channel(self, room: str) -> str:
        return f"{self.channel_prefix}:{room}"

    async def _ensure_redis(self) -> redis.Redis:
        if self._redis is None:
            self._redis = redis.from_url(self.redis_url, decode_responses=True)
        return self._redis

    async def _ensure_listener(self) -> None:
        if self._listener_task is not None and not self._listener_task.done():
            return
        r = await self._ensure_redis()
        self._pubsub = r.pubsub(ignore_subscribe_messages=True)
        self._listener_task = asyncio.create_task(self._listen_loop())

    async def _listen_loop(self) -> None:
        assert self._pubsub is not None
        try:
            async for message in self._pubsub.listen():
                if message["type"] != "message":
                    continue
                channel: str = message["channel"]
                if not channel.startswith(self.channel_prefix + ":"):
                    continue
                room = channel.split(":", 1)[1]
                try:
                    payload = json.loads(message["data"])
                except (json.JSONDecodeError, KeyError, TypeError):
                    continue
                # Local-only fan-out — don't re-publish or we'll loop.
                await self._broadcast_local(room, payload)
        except asyncio.CancelledError:
            return
        except Exception:  # noqa: BLE001
            logger.exception("ws-redis listener crashed; reconnect on next add()")

    async def add(self, room: str, ws: WebSocket, user_id: str) -> _Conn:
        conn = _Conn(ws=ws, user_id=user_id)
        async with self.lock:
            self.rooms.setdefault(room, set()).add(conn)
        await self._ensure_listener()
        if room not in self._subscribed_rooms:
            assert self._pubsub is not None
            await self._pubsub.subscribe(self._channel(room))
            self._subscribed_rooms.add(room)
        return conn

    async def remove(self, room: str, conn: _Conn) -> None:
        async with self.lock:
            if room in self.rooms:
                self.rooms[room].discard(conn)
                if not self.rooms[room]:
                    del self.rooms[room]
                    # Unsubscribe so we stop receiving for empty rooms.
                    if self._pubsub is not None and room in self._subscribed_rooms:
                        try:
                            await self._pubsub.unsubscribe(self._channel(room))
                        except Exception:  # noqa: BLE001
                            logger.exception("ws-redis unsubscribe failed (non-fatal)")
                        self._subscribed_rooms.discard(room)

    def list_rooms(self) -> list[str]:
        return list(self.rooms.keys())

    def conn_count(self, room: str) -> int:
        return len(self.rooms.get(room, set()))

    async def _broadcast_local(self, room: str, message: dict) -> int:
        sent = 0
        conns = list(self.rooms.get(room, set()))
        for conn in conns:
            try:
                await conn.ws.send_json(message)
                sent += 1
            except Exception:  # noqa: BLE001
                await self.remove(room, conn)
        return sent

    async def broadcast(self, room: str, message: dict) -> int:
        """Deliver to local sockets immediately AND publish to redis so
        other pods can fan out to their local sockets."""
        local_sent = await self._broadcast_local(room, message)
        try:
            r = await self._ensure_redis()
            await r.publish(self._channel(room), json.dumps(message))
        except Exception:  # noqa: BLE001
            logger.exception("ws-redis publish failed (returning local count only)")
        return local_sent


# Singleton — caller wires it into ws-core's router by swapping the import.
registry = _Registry()
