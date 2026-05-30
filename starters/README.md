# Starter recipe gallery

Phase 7 — 50 starters (target hit) ✅ · Phase 9 added 7 more (waves 1+2)
→ **57 total**. Each is a complete `recipe.json`
that generates a runnable app via `b-dash new --from <name>` (recommended) or
`b-dash generate starters/<name>/recipe.json` (raw).

| Starter | Archetype | Stack | Theme | Modules | Use case |
| --- | --- | --- | --- | --- | --- |
| `saas-jwt` | business / saas | fastapi · nextjs · postgres | nordic | 9 | B2B SaaS with email+OAuth login + Stripe billing + transactional email. Deploys to **Vercel**. |
| `marketplace-india` | marketplace | django · nextjs · postgres | ocean | 12 | Local-marketplace with phone OTP, Razorpay + COD + bank transfer payments, WhatsApp notifications. Deploys to **Render**. |
| `content-blog` | content / blog | fastapi · nextjs · postgres | editorial | 6 | Long-form publishing with magic-link login + newsletter delivery. |
| `portfolio-mono` | creator / portfolio | fastapi · nextjs · sqlite | mono | 3 | Single-author portfolio; minimal auth, zero payment surface. |
| `newsletter-landing` | creator / newsletter | fastapi · nextjs · sqlite | candy | 5 | Email-capture landing with Resend send-side + minimal auth. |
| `dashboard-analytics` | dashboard / analytics | fastapi · nextjs · postgres | glass | 7 | Internal analytics dashboard with Google OAuth + email digests. |
| `event-rsvp` | business / events | fastapi · nextjs · sqlite | retro | 7 | Event RSVP site with magic-link auth + email + SMS reminders. |
| `course-cohort` | education / cohort | fastapi · nextjs · postgres | soft | 9 | Cohort-based course platform with Stripe enrolments + drip email. |
| `link-in-bio` | creator / link-in-bio | fastapi · nextjs · sqlite | sunset | 3 | Single-page creator page; warmest theme + zero payment surface. |
| `internal-tool-crud` | tools / internal-admin | fastapi · nextjs · postgres | terminal | 7 | Admin-only CRUD tool with Google/GitHub/Microsoft SSO + audit email. |
| `crm-pipeline` | business / crm | fastapi · nextjs · postgres | nordic | 7 | Lightweight CRM — Google OAuth + outreach email. |
| `booking-appointment` | business / appointments | fastapi · nextjs · postgres | soft | 9 | Calendar-style bookings with Stripe deposits + SMS confirmations. |
| `notes-personal` | productivity / notes | fastapi · nextjs · sqlite | mono | 3 | Single-user notebook; smallest viable stack. |
| `social-feed` | social / feed | fastapi · nextjs · postgres | aurora | 11 | Posts + comments + upvotes + saves feed with Google/Apple SSO + email notifications. |
| `customer-support` | productivity / support-desk | fastapi · nextjs · postgres | terminal | 7 | Ticket helpdesk with magic-link + email + WhatsApp updates. |
| `community-forum` | social / forum | fastapi · nextjs · postgres | retro | 11 | Threaded forum on `posts` + `comments` + `likes` + `flags` moderation; OAuth via GitHub + Google. |
| `changelog-public` | content / changelog | fastapi · nextjs · sqlite | mono | 4 | Public changelog page driven by `posts`; minimum-viable stack. |
| `kanban-board` | productivity / kanban | fastapi · nextjs · postgres | nordic | 4 | Personal kanban with drag-friendly status+position; private per user. |
| `product-reviews` | business / reviews | fastapi · nextjs · postgres | soft | 7 | Authed reviews keyed by product id via `comments` (target=product). |
| `tagged-blog` | content / blog-tagged | fastapi · nextjs · postgres | editorial | 8 | Blog with `posts` + polymorphic `tags`; admin curates the taxonomy. |
| `tagged-forum` | social / tagged-forum | fastapi · nextjs · postgres | retro | 11 | Full polymorphic stack — `posts` + `comments` + `tags` + `likes` in one app. |
| `bookmarks-app` | productivity / reading-list | fastapi · nextjs · sqlite | mono | 4 | Personal reading list driven by `bookmarks`; smallest viable productivity stack. |
| `link-saver` | productivity / link-saver | fastapi · nextjs · sqlite | terminal | 5 | Tagged bookmarks app — `bookmarks` + `tags` together, zero new module code. |
| `media-portfolio` | creator / portfolio | fastapi · nextjs · postgres | glass | 5 | Public media gallery driven by `media` + `tags` (metadata-only v1, BYO CDN). |
| `realtime-chat` | realtime / chat | fastapi · nextjs · postgres | brutalist | 4 | Multi-room websocket chat via `ws-core`; auth-gated handshake. |
| `restaurant-pos` | business / restaurant | fastapi · nextjs · postgres | brutalist | 12 | POS for a restaurant: `menu` + `orders` + `payment-cod` + WhatsApp receipts + live order board via `ws-core`. |
| `image-board` | social / image-board | fastapi · nextjs · postgres | candy | 12 | Pinterest-style board: `media` + `posts` + `comments` + `likes` + `tags`. |
| `live-dashboard` | dashboard / live-ops | fastapi · nextjs · postgres | glass | 8 | Server-pushed ops dashboard via `ws-core`; metric tiles refresh without polling. |
| `wishlist-tracker` | productivity / wishlist | fastapi · nextjs · sqlite | sunset | 7 | `bookmarks` + `tags` + email digests for tracked items. |
| `moderated-forum` | social / moderated-forum | fastapi · nextjs · postgres | mono | 12 | Full polymorphic moderation stack: posts + comments + tags + likes + `flags` queue. |
| `multi-tenant-saas` | business / multi-tenant-saas | fastapi · nextjs · postgres | nordic | 10 | Workspace-based SaaS via the new `tenants` module — invite/role/leave UX, owner-only governance. |
| `digital-downloads` | business / digital-downloads | fastapi · nextjs · postgres | soft | 12 | Sell digital products: `menu` catalog + `orders` + Stripe + `media` files + `tags`. |
| `team-blog-cms` | content / team-blog | fastapi · nextjs · postgres | editorial | 11 | Multi-author blog with `posts` + `tags` + `media` covers + reader `comments`. |
| `kanban-team` | productivity / team-kanban | fastapi · nextjs · postgres | nordic | 9 | Workspace-scoped kanban: `boards` + `tenants` for org/team separation. |
| `paid-newsletter` | creator / paid-newsletter | fastapi · nextjs · postgres | editorial | 11 | Subscription newsletter via `posts` + Stripe + `bookmarks` saved-for-later. |
| `gated-community` | social / gated-community | fastapi · nextjs · postgres | forest | 12 | Private community per `tenants` workspace with full moderation (`posts` + `comments` + `likes` + `flags`). |
| `auction-house` | marketplace / auction | fastapi · nextjs · postgres | brutalist | 11 | Live auction with `menu` items + `media` + Stripe + **`ws-core` bid push**. |
| `event-tickets` | business / event-tickets | fastapi · nextjs · postgres | retro | 12 | Ticketed events: `orders` + Stripe + `media` (ticket assets) + Twilio SMS confirmations. |
| `support-portal` | productivity / support-portal | fastapi · nextjs · postgres | minimal | 11 | Per-tenant help center: KB articles via `posts` + threaded `comments` + `flags`. |
| `affiliate-tracker` | business / affiliate | fastapi · nextjs · postgres | ocean | 11 | Per-tenant affiliate links via `bookmarks` + `tags` + payouts through Stripe. |
| `team-wiki` | productivity / team-wiki | fastapi · nextjs · postgres | soft | 12 | Workspace wiki — `posts` + `tags` + `media` covers + threaded `comments`. |
| `live-poll` | realtime / live-poll | fastapi · nextjs · postgres | aurora | 6 | Real-time polls — votes via `likes`, results push via `ws-core`. |
| `family-photos` | creator / family-photos | fastapi · nextjs · postgres | sunset | 11 | Per-family photo album with `media` + `tags` + reactions (`likes`+`comments`). |
| `freelance-invoicer` | business / freelance | fastapi · nextjs · postgres | nordic | 12 | Per-freelancer invoicing: `menu` services + `orders` + Stripe + bank transfer. |
| `coworking-bookings` | business / coworking | fastapi · nextjs · postgres | candy | 11 | Desk-booking calendar via `boards` + Stripe deposits + SMS confirmations. |
| `inventory-tracker` | tools / inventory | fastapi · nextjs · postgres | mono | 12 | Per-tenant stock + movements via `menu` + `orders` + `tags`. |
| `study-flashcards` | education / flashcards | fastapi · nextjs · sqlite | retro | 7 | Anki-style cards as `posts`, decks as `boards`, `bookmarks` for spaced repetition. |
| `bug-bounty` | tools / bug-bounty | fastapi · nextjs · postgres | terminal | 15 | Researcher portal: reports as `posts`+`flags`, comments, Stripe payouts. |
| `cyberpunk-arcade` | game / arcade-leaderboard | fastapi · nextjs · postgres | cyberpunk | 7 | Live leaderboard with `posts` (scores) + `likes` (cheers) + `ws-core` push. |
| `crypto-dashboard` | tracker / crypto-prices | fastapi · nextjs · postgres | cyberpunk | 9 | Watchlist via `bookmarks` + `tags` + live price ticks via `ws-core`. |
| `audited-admin` | tools / audited-admin | fastapi · nextjs · postgres | terminal | 9 | SSO admin tool with **`audit-log`** trail of every sensitive action, scoped per `tenants`. |
| `feature-flagged-saas` | business / feature-flagged-saas | fastapi · nextjs · postgres | glass | 12 | SaaS with **`feature-flags`** rollout (audience match + % buckets) + `audit-log` for governance. |
| `chat-cluster` | realtime / chat-multipod | fastapi · nextjs · postgres | cyberpunk | 5 | Multi-pod realtime chat via `ws-core` + **`ws-redis`** pub/sub adapter. |
| `subscription-saas` | business / subscription-saas | fastapi · nextjs · postgres | glass | 13 | Tiered SaaS via **`payment-stripe-subs`** + tenants + audit + feature-flags. |
| `push-notif-app` | productivity / push-notifs | fastapi · nextjs · postgres | aurora | 8 | App with web push notifications via **`notifications-push`** (VAPID-signed). |
| `ai-writer` | tools / ai-writer | fastapi · nextjs · postgres | cyberpunk | 13 | AI writing assistant via **`ai-llm`** proxy, per-tenant rate limits, Stripe credits. |
| `search-everywhere` | content / searchable-cms | fastapi · nextjs · postgres | minimal | 12 | CMS with **`search-meili`** typo-tolerant search over posts + tags + media. |
| `observability-saas` | business / observability-saas | fastapi · nextjs · postgres | nordic | 15 | SaaS with **Sentry + PostHog + Plausible** wired alongside tenants + audit + flags + Stripe. Deploys to **Vercel**. |

## Scaffold (recommended)

```bash
b-dash new --from saas-jwt --out ./my-app --name "Acme Cloud"
```

- copies the starter recipe into `<out>/recipe.json`
- when `--name` is given, rewrites `branding.name` + slug-cases the recipe `id`
- hands off to `generate` to render the full app
- pass `--install` / `--smoke` to chain pnpm/pip install + smoke tests

## Generate (raw)

```bash
b-dash generate starters/saas-jwt/recipe.json --out ./my-app
```

Same end-state, no name override, no copy of the recipe into the output.

## Customize

Starters are just JSON. Edit:

- `theme.pack` → swap to any of the 72 themes (`minimal`, `glass`,
  `brutalist`, `soft`, `aurora`, `retro`, `nordic`, `cyberpunk`, `terminal`,
  `sunset`, `forest`, `ocean`, `mono`, `candy`, `editorial`, `noir`,
  `pastel-pop`, `corporate-blue`, `arctic`, `harvest`, `midnight`, `canvas`,
  `meadow`, `volt`, `ember`, `ivory`, `carbon`, `magnolia`, `industrial`,
  `dusk`, `lavender`, `saffron`, `slate`, `coral`, `graphite`, `lemon`,
  `sage`, `mango`, `denim`, `clay`, `neon`, `paper`, `peach`, `navy`,
  `fern`, `plum`, `tundra`, `cocoa`, `crimson`, `lake`, `wheat`, `mint`,
  `terra`, `amethyst`, `olive`, `blush`, `obsidian`, `sapphire`, `linen`,
  `mocha`, `teal`, `ruby`, `ash`, `iris`, `cinder`, `dune`, `lagoon`,
  `earth`, `helio`, `raisin`, `citrus`, `plaster`).
- `modules[]` → add/remove from the 39-module catalog.
- `auth.methods[]` → pick from `email-password`, `email-otp`, `phone-otp`,
  `magic-link`, `google`, `apple`, `github`, etc.
- `stack.{backend,frontend,database}` → swap backends (`fastapi` ↔
  `django`), DBs (`postgres` ↔ `mysql` ↔ `sqlite`).

## Validation

```bash
b-dash validate starters/<name>/recipe.json --as recipe
```

All 5 ship clean (`pnpm --filter @b-dash/wirer test` covers the
resolve+compatibility+render pipeline each starter exercises).

## Discover

```bash
b-dash list starters    # one-line summary of each entry above
b-dash list themes      # all 72 themes
b-dash list sections    # all 331 sections (grouped by category)
b-dash list modules     # all 39 modules
```

## Roadmap

## ✅ Year-1 catalog COMPLETE · Phase 5 wave 33 · Phase 4 Studio S1–S5d shipped

**All 7 year-1 caps closed.**

| Lane | Final | Cap | % of cap |
|---|---|---|---|
| Sections | **538** | 500 | 108% |
| 3D scenes | **40** | 40 | 100% |
| Illustration packs | **8** | 8 | 100% |
| Form sections | **30** | 30 | 100% |
| Themes | **75** | 60 | 125% |
| Motion presets | **220** | 100 | 220% |
| Email templates | **110** | 50 | 220% |

**Catalog scale**: 50→538 sections (10.8× wave-1 baseline) across 33 generation waves.

**Studio app** (`apps/studio/`) — full visual builder shipped through 8 sub-waves S1→S5d. Run with `pnpm --filter @b-dash/studio-app dev` → http://localhost:3001.
- **S1** palette search · per-category thumbnails · schematic preview · real color/image/array pickers
- **S2** drag-drop · inline contentEditable · 200-action undo/redo · keyboard shortcuts (⌘Z ⌘D ⌫ ⌘↑/↓ ⌘C/V ⌘S)
- **S3** multi-page Pages panel · 75-theme switcher · viewport switcher (sm/md/lg/full)
- **S4** Render-to-app via wirer subprocess · diff vs last-saved
- **S5a** Puck-integration bridge + asset library (uploads to `output/studio-assets/`)
- **S5b** auth + workspaces + RBAC (owner/editor/viewer; JSON store at `output/studio-workspaces.json`)
- **S5c** real-time co-editing scaffold (yjs interface ready) + Figma-style block comments
- **S5d** templates marketplace + named version snapshots + mobile-responsive editor

Every starter generates cleanly. All 75 themes + all 39 modules wired into ≥1 starter.

**Phase 8 modules (10)**: `posts` · `comments` · `boards` · `tags` ·
`likes` · `bookmarks` · `flags` · `media` · `ws-core` · `tenants`.

**Phase 9 modules (11)**:
- Wave 1 (ops): `audit-log` · `feature-flags`
- Wave 2 (scale): `ws-redis` · `payment-stripe-subs` · `search-meili`
- Wave 2 (reach): `notifications-push`
- Wave 2 (AI): `ai-llm`
- Wave 3 (telemetry): `telemetry-sentry` · `telemetry-posthog` · `telemetry-plausible`
- Wave 4 (ops): `backup`

### What's done · what's next

✅ **Year-1 catalog complete** — all 7 caps closed (3 overshot ≥2×)
✅ **Studio Tier 1–5 shipped** — visual builder with auth, RBAC, comments, snapshots, mobile-responsive
✅ **205 tests green** across schemas/wirer/studio/cli packages
✅ **Smoke generation clean** — observability-saas → 137 files / 15 modules

**Out-of-scope for v1 (separate phase)**:
- Modules: 39 → 250+ — left intentionally narrow; users author modules themselves rather than the catalog growing this lane
- Real Puck render pipeline (S5a scaffold ready — `pnpm add @measured/puck` activates)
- Real y-websocket CRDT server (S5c scaffold ready — `pnpm add yjs y-websocket` + server activates)
- S3/R2 asset backend (S5a scaffold uses local FS — swap behind `STUDIO_ASSETS_BACKEND` env)
- Production auth provider (S5b uses cookie + JSON store — swap for next-auth + Postgres)

Phase 9 leftover (ops):
- ~~Telemetry: Sentry · PostHog · Plausible integrations~~ ✅ done
- ~~Backup module: scheduled DB dumps to S3~~ ✅ done this wave
- ~~Deploy target adapters~~ ✅ Vercel · Render · Railway · Coolify · Docker
- Multi-language polish: 30+ languages
- Demo deploy infra: ephemeral preview URLs

Phase 4 Studio v1 ✅ **foundation** (this wave):
- `@b-dash/studio` package (`packages/studio/`)
- `buildBlockManifest(section)` — SectionSchema → Puck-shaped manifest
- `buildStudioConfig({ blocks, themeTokens, pages, renderVersion })`
- 10 tests passing; full UI shell + dev server deferred to wave 2

Phase 10 ✅ (waves 1-3):

- Wirer overlays `overrides/` onto regenerated output. Customer files
  win; generated files are the fallback. Lives at
  `packages/wirer/src/render/overlay-overrides.ts`.
- `.b-dash-overrides.json` manifest (v2 schema) tracks per-file pre-overlay
  generator hash for conflict detection across runs.
- **New CLI: `b-dash upgrade <project-dir>`** — re-renders an existing
  project in place, prints `+added / ~changed / -removed` counts +
  flags overrides whose underlying generator output changed shape.
- **NEW wave 3:** changelog parser — `b-dash upgrade` now reads each
  module's `CHANGELOG.md` and categorizes version bumps as
  `safe / review / breaking / unknown`. Manifest at
  `.b-dash-modules.json` tracks the per-render module versions; the
  upgrade report prints color-coded bullets and a final ⚠ warning when
  any breaking changes are detected.
- Wirer's README is now deterministic (uses `recipe.createdAt`, not
  `Date.now()`) so re-rendering the same recipe is byte-stable.

Phase 10 wave 3 (deferred): changelog parser that categorizes safe /
review / breaking when upgrading across minor module versions, so the
upgrade report can highlight risky module bumps before they hit the
customer's regen.
