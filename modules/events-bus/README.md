# events-bus — in-process pub/sub

Implements `events@v1`. Subscribers receive `(payload, db_session)` so they
write within the caller's transaction (PLAN §13).

No router, no model. Wirer copies `bus.py` to `<out>/backend/app/events_bus/bus.py`.
Other modules import `from app.events_bus.bus import emit, subscribe`.

Variants planned:
- `events-redis` — cross-process bus via Redis pub/sub
- `events-sns` — AWS-native fan-out
