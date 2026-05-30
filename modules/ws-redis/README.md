# ws-redis

Implements `ws-redis@v1`. Multi-pod adapter for `ws-core`. Drop-in
replacement for the process-local registry — same public surface
(`add`/`remove`/`broadcast`/`list_rooms`/`conn_count`).

## Why

`ws-core` registry is in-memory + process-local. On a single-pod /
single-worker deployment that's fine. On multi-pod (Render with N web
workers, Railway with autoscale, k8s with replicas > 1) a broadcast on
pod A never reaches a client connected to pod B. `ws-redis` fixes that
by routing broadcasts through Redis pub/sub.

## How

On every pod:

```
local conns: dict[room → set[ws]]      ← unchanged from ws-core
redis pubsub: subscribed to `ws:<room>` for every room with a local conn
```

`broadcast(room, msg)`:

1. Fan out to local sockets in `room` (fast path).
2. PUBLISH on `ws:<room>` (cross-pod).

Every pod (including the publisher) receives the redis message and fans
out to its local sockets ONLY. The publisher's local fan-out happens
before the publish, so it's not duplicated — the redis-side fan-out is
exclusive to remote pods because the publisher's room set already
includes its locals and the subscriber path doesn't re-publish.

## Endpoints

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/api/ws-redis/rooms` | Admin debug — rooms + local conn count + subscription state. |

The actual websocket endpoint stays in `ws-core`. To use ws-redis behind
ws-core, swap the registry import in `app.main` after both routers mount:

```python
from app.ws_redis.registry import registry as ws_registry
import app.ws_core.router as ws_core_router
ws_core_router.registry = ws_registry
```

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `redis_url` | `redis://localhost:6379/0` | Override via `REDIS_URL` env. |
| `channel_prefix` | `ws` | Channel naming = `<prefix>:<room>`. |

## Dependency

- **Python**: `redis>=5` (the official async client with `redis.asyncio`).
- **Runtime**: a Redis instance reachable at `REDIS_URL`. Local dev:
  `docker run -p 6379:6379 redis:7-alpine`.

## Used by

- `chat-cluster` starter (multi-pod realtime chat).
- Any starter that wires `ws-core` and runs more than one app worker.
