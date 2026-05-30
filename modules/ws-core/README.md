# ws-core

Implements `ws-core@v1`. Process-local WebSocket primitives — a connection
registry keyed by room + an HTTP broadcast endpoint that other modules /
clients can POST to.

**FastAPI backend only in v1.** Django WebSockets need Channels; not in
scope. Recipes that use `ws-core` MUST set `stack.backend = "fastapi"`.

## Surface

### WebSocket

```
WS  /api/ws/{room}?token=<jwt>
```

- Validates `token` via `auth_core.utils.decode_session_token` before
  accepting the handshake. Bad token → 1008 (policy violation).
- After accept, every JSON message the client sends is broadcast to every
  other connection in the same `room` as
  `{ "type": "message", "from": "<userId>", "payload": <msg> }`.
- Server emits `ws.connected` + `ws.disconnected` events on the bus.

### HTTP

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| POST | `/api/ws/broadcast` | signed-in user | `{ room, message }` → pushes to every conn in `room`. Returns `{ room, recipients }`. |
| GET | `/api/ws/rooms` | admin | List active rooms + conn counts. |

## Pushing from other modules

```python
from app.ws_core.registry import registry
await registry.broadcast("orders", {"event": "order.placed", "id": "o-123"})
```

Subscribe to the bus and re-broadcast for cross-module fan-out.

## Limits

- Process-local registry. Multi-pod deployments need a redis-backed
  variant (planned `ws-redis` adapter — wave 2).
- No automatic ping/pong heartbeat in v1; tune client-side `setInterval`
  with `wsApi.broadcast({ room, message: { type: "ping" } })` for now.

## Used by

- `realtime-chat` starter (rooms = chat channels).
- Wire into any module that wants to push events to live clients (orders,
  notifications, presence).
