"""Process-local connection registry — keyed by room name.

Not thread-safe across workers — fine for single-process dev + Render's
single-worker default. For multi-pod, swap in a redis-backed registry in
ws-redis (planned wave 2) that pub/subs over a channel.
"""
from __future__ import annotations

import asyncio
from collections.abc import Iterable
from dataclasses import dataclass, field

from fastapi import WebSocket


@dataclass
class _Conn:
    ws: WebSocket
    user_id: str


@dataclass
class _Registry:
    rooms: dict[str, set[_Conn]] = field(default_factory=dict)
    lock: asyncio.Lock = field(default_factory=asyncio.Lock)

    async def add(self, room: str, ws: WebSocket, user_id: str) -> _Conn:
        conn = _Conn(ws=ws, user_id=user_id)
        async with self.lock:
            self.rooms.setdefault(room, set()).add(conn)
        return conn

    async def remove(self, room: str, conn: _Conn) -> None:
        async with self.lock:
            if room in self.rooms:
                self.rooms[room].discard(conn)
                if not self.rooms[room]:
                    del self.rooms[room]

    def list_rooms(self) -> Iterable[str]:
        return list(self.rooms.keys())

    def conn_count(self, room: str) -> int:
        return len(self.rooms.get(room, set()))

    async def broadcast(self, room: str, message: dict) -> int:
        """Send `message` (already a dict) to every conn in `room`.
        Returns the number of successful sends. Failed sends are dropped
        silently — the receive loop will detect the dead conn + remove it.
        """
        sent = 0
        conns = list(self.rooms.get(room, set()))
        for conn in conns:
            try:
                await conn.ws.send_json(message)
                sent += 1
            except Exception:
                # Connection dropped between snapshots — receive loop will clean up
                await self.remove(room, conn)
        return sent


# Singleton — imported by router + by other modules that want to push.
registry = _Registry()
