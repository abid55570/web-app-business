# Spike Notes

Phase 0 wiring decisions. These inform contract design in Phase 1. Append-only log.

---

## 2026-05-09 — Backend foundation

### Decision: Async SQLAlchemy 2.0 + asyncpg/aiosqlite
- Async throughout to match FastAPI's strengths.
- `AsyncSession` injected via FastAPI dependency (`get_db`).
- Default DB is SQLite (`./spike.db`) for fast local iteration; switch to Postgres via `DATABASE_URL`.

### Decision: bcrypt + JWT for sessions (stateless)
- bcrypt with 12 rounds (settings-tunable via `BCRYPT_ROUNDS`).
- JWT for session tokens; 7-day default expiry.
- Symmetric HS256 signing — adequate for single-tenant generated apps.
- **Phase 1 implication**: contract should declare `Session.token` as opaque string. Don't lock implementations into JWT.

### Decision: Same error code for "wrong password" and "user not found"
- Both return `AUTH_INVALID` (HTTP 401).
- Prevents email enumeration on the login endpoint.
- **Phase 1 implication**: bake this assumption into contract conformance tests.

### Decision: Email is case-insensitive
- Lowercased on signup + login (server-side).
- **Phase 1 implication**: contract MUST require case-insensitive email matching.

### Decision: Response casing inconsistency (deferred)
- Internal Python: snake_case.
- `SessionResponse` aliases to camelCase (`userId`, `expiresAt`); `UserResponse` does not yet.
- **Phase 1 fix**: pick one — recommend camelCase for all public API responses (OpenAPI convention) and enforce via a global Pydantic config or response middleware.

### Decision: Stateless logout (no-op server-side)
- Spike: `POST /api/auth/logout` returns 204 but doesn't revoke the token.
- **Phase 1 implication**: real implementation needs a session store (Redis or DB) for revocation. Contract should still declare 204 regardless.

### Decision: Error response shape
- Custom exceptions (`AuthError`) flow through `register_error_handlers` in `app.middleware.error_handler`.
- Body shape: `{ "code": "AUTH_INVALID", "message": "..." }` (matches PLAN §17.3).
- FastAPI's built-in `HTTPException(detail={...})` wraps it differently — the detail object becomes nested.
- **Phase 1 fix**: write a single error normalizer so HTTPException + AuthError + ValidationError all produce the same shape.

### Test posture
- Unit tests: pure-function (auth utils — hashing, JWT roundtrip, expiry).
- Integration tests: full HTTP cycle via `httpx.AsyncClient` + ASGI transport, in-memory SQLite per test (rolled back).
- Contract conformance tests: read `contracts/auth@v1.contract.yaml` and assert response shapes/codes.

---

## Open contract questions surfaced by the spike

- `Session.token` shape: opaque string vs structured? **Spike chose opaque; contract should match.**
- `User.createdAt` required in all response contexts? Spike returns it everywhere; contract MUST clarify per-endpoint visibility.
- OAuth flow (`/api/auth/oauth/{provider}/{start,callback}`) — not in spike yet. Add when first OAuth provider lands (likely Google in chunk 3).
- Email verification flow — not in spike. Add when email integration lands.
- Password reset flow — not in spike. Add when email integration lands.
- 2FA — not in spike. Add post-MVP.

---

## Errors discovered during spike build
- (none yet — append as encountered)

---

## 2026-05-09 — Chunks 2 + 3 (frontend + menu)

### Decision: Refactored AuthError into shared AppError base
- Original spike had `AuthError(Exception)` with `code/message/status_code`.
- Adding `MenuError` revealed duplication — introduced `app/errors.py:AppError` as the base.
- Both `AuthError` and `MenuError` now extend `AppError` (no custom `__init__`).
- `error_handler.py` registers a single handler for `AppError` — catches all subclasses.
- **Phase 1 implication**: contract spec MUST formalize the `{ code, message }` error shape. All service-layer errors MUST extend AppError (or its template-stack equivalent).

### Decision: Frontend uses httpOnly cookie via Next.js API proxies (never exposes JWT)
- Backend returns the JWT in the response body. The Next.js API route (`/api/auth/login` etc.) reads it and sets the `spike_session` httpOnly cookie. The token never reaches the client JS.
- Server components read the cookie via `cookies()` and forward to backend with `Authorization: Bearer`.
- Matches PLAN §33.2.
- **Phase 1 implication**: frontend templates MUST always include the API proxy pattern. Cookie sits between browser ↔ Next.js server; bearer token sits between Next.js server ↔ backend.

### Decision: Server components for reads, API routes for mutations
- Public menu page (`/menu`) is a server component reading directly from backend (no auth required).
- Admin pages (`/admin/menu`, `/admin/menu/[id]/edit`) are server components reading from backend with the cookie token.
- Mutations (POST / PATCH / DELETE) go through Next.js API route proxies.
- Avoids needing CSRF tokens on reads and keeps the JWT off the client.

### Decision: `business_field`-style config knob deferred for menu
- For the spike, MenuItem has a single `category` string field, not a separate Category entity.
- Categories emerge from values used; `/api/menu/categories` does a `SELECT DISTINCT`.
- **Phase 1 implication**: For the generator's stock-management module (PLAN §41.1), formalize variants/batches as separate models. Menu can stay simple.

### Decision: Public endpoints hide unavailable items via 404 (not 403)
- `GET /api/menu/{id}` returns 404 if `is_available=False` — indistinguishable from "doesn't exist".
- Admin endpoints return the item regardless of availability.
- **Phase 1 implication**: contract MUST specify that public list/detail endpoints filter by `isAvailable`.

### Decision: Dual-router pattern for public vs admin
- `app/menu/router.py` exports `public_router` and `admin_router`.
- `main.py` mounts them at `/api` and `/api/admin` respectively.
- Cleaner than per-route auth dependencies.
- **Phase 1 implication**: contract specs should explicitly partition operations into "public" and "auth-required" buckets so the wirer can pick the right shells.

### Open questions surfaced by Chunk 3
- Should `/api/menu/categories` include unavailable categories that have at least one available item? **Spike: no — we filter by availability, then distinct.**
- Should "delete" be soft delete (mark inactive) or hard delete? **Spike: hard delete.** Phase 1 should consider soft-delete for audit trail, particularly for items referenced by completed orders.
- Image handling: spike uses `imageUrl: string`. **Phase 1 needs**: file upload module (S3/R2/local) + signed URLs.

---

## 2026-05-09 — Chunk 4 (orders + payment adapter)

### Decision: Order items are denormalized as JSON snapshot
- `orders.items` is a JSON column with the item ID, name, qty, unit price, currency, subtotal at order time.
- Why: menu edits later (price change, name change, item deleted) MUST NOT mutate historical orders.
- Trade-off: no FK to menu_items. Reporting becomes harder; consider a normalized OrderItem table in Phase 1 if needed for analytics.
- **Phase 1 implication**: `orders@v1` contract MUST formalize this — item details in an Order are a snapshot, not a live reference.

### Decision: Payment is processed synchronously inside `create_order`
- `create_order` calls `payment_adapter.create_intent` then `capture` immediately.
- Spike default: `FakePaymentAdapter` — always succeeds.
- On payment failure, order is left in `pending` with `payment_status=failed` and a `402 ORDER_PAYMENT_FAILED` is raised.
- **Phase 1 implication**: real Stripe integration will require an async pattern — `create_intent` returns clientSecret to the frontend, frontend confirms via Stripe.js, backend listens to webhook to flip the order to `confirmed`. For the spike's fake adapter, sync is fine and mirrors the eventual UX for COD/wallet methods.

### Decision: Single PaymentAdapter base class with module-level singleton
- `app/payment/adapters.py` exposes `get_payment_adapter()` and `set_payment_adapter()` (test hook).
- One global adapter for the whole app. Phase 1 will replace this with a per-recipe selection (multi-gateway: customer chooses at checkout).
- **Phase 1 implication**: contract `payment@v1` formalizes the `PaymentAdapter` interface (`create_intent`, `capture`, `refund`). Wirer mounts the adapters configured in `recipe.integrations.payment`.

### Decision: Customer scope vs admin scope = same `get_order` function with optional `customer_id`
- `get_order(db, order_id, customer_id=None)` — when `customer_id` is provided, restricts to that customer; otherwise sees all.
- Customer routes pass `customer_id=user.id`; admin routes pass `None`.
- A customer trying to read another user's order gets `404 ORDER_NOT_FOUND` — **same shape as actually-not-found**, prevents enumeration.
- **Phase 1 implication**: contract MUST formalize this invariant — never 403 for "not yours", always 404.

### Decision: Cart is client-only (localStorage), no server-side cart
- Cart state lives in `CartContext` (React Context + localStorage at `spike_cart_v1`).
- Cart persists across reloads but not across devices/browsers — fine for spike.
- Checkout requires auth; an unauthenticated checkout shows "Please sign in" + 1.2 sec redirect to /login.
- **Phase 1 implication**: optional server-side cart module for cross-device sync. Out of scope for v1.

### Decision: Status update is unrestricted (no state machine)
- Admin can move an order to ANY status, even invalid transitions like cancelled → confirmed.
- Pydantic `Literal` enforces valid status names; nothing enforces valid transitions.
- **Phase 1 implication**: state machine should be added (`StateMachine(['pending', 'confirmed', ...]).allow('confirmed' -> ['preparing', 'cancelled'])`). Add to `orders@v1` invariants.

### Decision: AppError refactor proves itself
- All three modules (auth, menu, orders) now throw subclasses of `AppError`.
- Error handler stays at 1 line per case. No code duplication.
- This pattern goes into the Phase 1 generator template.

### Open questions surfaced by Chunk 4
- Multi-currency in one order: spike uses the LAST item's currency. **Phase 1 must reject mixed-currency orders or formalize FX**.
- Refund semantics with Fake adapter: `payment_status` flips to `refunded` immediately. With Stripe, refund is async (refund.processed webhook). The contract should declare refund as eventually-consistent.
- Concurrent inventory: spike doesn't decrement stock on order. PLAN §41.1 (stock-management module) handles this via the `orders.placed` event subscriber. Out of spike scope.
- Idempotency on `POST /api/orders`: a double-submit creates two orders. Add an `Idempotency-Key` header pattern in Phase 1.

---

## 2026-05-09 — Chunk 5 (event bus + notifications)

### Decision: In-process bus with session forwarding
- `app/events/bus.py` is a tiny module-level registry. `subscribe(event_id, handler)` and `emit(event_id, payload, db)`.
- The emitter passes its **own db session** through to subscribers so handlers write within the same transaction.
- Trade-off: tight coupling to the request session. Phase 1's Redis-backed bus will not have this property — handlers will need their own session lifecycle.
- **Phase 1 implication**: contract `events@v1` (now written) needs to declare two operating modes — in-process (handlers share session) vs. queued (handlers open own session). The wirer picks based on `recipe.integrations.events`.

### Decision: Adapters fall back to "test-mode" when unconfigured
- `WhatsAppAdapter(token=None, phone_number_id=None)` returns `status="sent-test"` instead of failing.
- This means tests run with no API keys, dev runs without setup, and production fails loud only when the customer expects real delivery.
- The `NotificationLog` records `sent-test` distinctly from `sent` so we can audit which deliveries were real.
- **Phase 1 implication**: this pattern goes into the integration template guide. Every adapter MUST have a working test-mode default.

### Decision: Routing matrix is module-level (hardcoded for spike)
- `notifications/service.py:ROUTING` maps `event_id -> [(channel, template), ...]`.
- Hardcoded for `order.placed` (email + whatsapp) and `order.cancelled` (email).
- **Phase 1 implication**: this becomes `recipe.notifications.perEventChannels` from PLAN §13. The wirer compiles the matrix from `recipe.json` into the dispatch table.

### Decision: Failed adapters don't halt other channels
- If WhatsApp adapter throws, the email handler still runs. Both attempts are recorded (one as `sent`, one as `failed`).
- Matches the bus's "log handler exceptions, don't propagate" principle.
- Customer-visible behavior: order completes successfully even if a notification fails.

### Decision: NotificationLog is the single source of truth for "what was sent"
- Every dispatch attempt writes a row, regardless of outcome (sent / sent-test / failed / skipped).
- Indexed on `channel` and `triggered_by_event` for filtering.
- Admin can audit at `GET /api/admin/notifications`.

### Open questions surfaced by Chunk 5
- Retry policy: failed dispatches are not retried. Phase 1 needs a queue + retry pattern (exponential backoff per PLAN §70).
- Bounce handling: `NotificationLog.status` doesn't update if a downstream provider reports a bounce. Phase 1 needs webhook handlers per provider.
- Recipient resolution: the spike pulls `recipient` from the payload (set by the emitter). Better: have a per-channel resolver that turns a `customerId` into the right address (email for email channel, phone for SMS, etc.). Phase 1 design.
- WhatsApp template approval: Meta requires pre-approved templates. Spike just passes a template name; Phase 1 needs a registry + verification step.
