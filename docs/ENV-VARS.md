# Environment variables

Complete reference. Grouped by **what runs where**:

1. **Generator + Studio** (b-dash itself)
2. **Generated app — backend** (FastAPI/Django)
3. **Generated app — frontend** (Next.js)
4. **Per-module env vars** (Stripe, Twilio, Sentry, etc.)

Every variable is marked:
- `(required)` — generation/runtime will refuse to start without it
- `(optional)` — has a sensible default or feature disables cleanly when unset
- `(dev only)` — useful for local development; do not set in prod

---

## 1 · Generator + Studio

These affect the b-dash tooling itself (the wirer CLI + the Studio app at `apps/studio/`).

### Wirer / CLI

| Var | Required | Default | What it does |
|---|---|---|---|
| `NODE_ENV` | optional | `development` | `production` disables verbose logs in generated boilerplate |
| `BDASH_SECTIONS_ROOT` | optional | `./sections` | Override section catalog discovery path |
| `BDASH_THEMES_ROOT` | optional | `./themes` | Override theme catalog discovery path |
| `BDASH_MODULES_ROOT` | optional | `./modules` | Override module catalog discovery path |
| `BDASH_TEMPLATES_ROOT` | optional | `./templates` | Override email template discovery path |

### Studio (`apps/studio/`)

| Var | Required | Default | What it does |
|---|---|---|---|
| `STUDIO_OUTPUT_DIR` | optional | `<project>/output` | Where studio-state.json, snapshots, uploads, workspaces live |
| `STUDIO_ASSETS_BACKEND` | optional | `fs` | `fs` (local) or `s3` (production — see below) |
| `STUDIO_SECTIONS_ROOT` | optional | `<project>/sections` | Override for the path the catalog API reads from |
| `S3_BUCKET` | required if `STUDIO_ASSETS_BACKEND=s3` | — | Asset upload destination |
| `S3_REGION` | required if `STUDIO_ASSETS_BACKEND=s3` | — | AWS region |
| `AWS_ACCESS_KEY_ID` | required if `s3` | — | Standard AWS creds |
| `AWS_SECRET_ACCESS_KEY` | required if `s3` | — | Standard AWS creds |
| `DATABASE_URL` | optional | — | When set, swap the JSON workspace store for Postgres (S5b code reads this; activation is a one-file swap) |
| `YJS_WEBSOCKET_URL` | optional | — | E.g. `ws://yjs:1234` — when set, enables S5c real-time collab via y-websocket sidecar |
| `STUDIO_AUTH_PROVIDER` | optional | `cookie` | `cookie` (dev MVP) or `nextauth` (prod swap with email/oauth) |
| `STUDIO_SESSION_SECRET` | required in prod | random per restart | Cookie-signing secret; set to a long random hex string |

Generate a session secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 2 · Generated app — backend

These appear in every starter that includes the listed module. The wirer derives them from `module.yaml`'s `env_keys` field and emits a `.env.example` listing all of them.

### Core (always present)

| Var | Required | Default | What it does |
|---|---|---|---|
| `DATABASE_URL` | required | — | Postgres / SQLite connection string. SQLite: `sqlite:///./app.db`. Postgres: `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET` | required | — | Token signing secret. **Must** be ≥32 random bytes |
| `JWT_ALGORITHM` | optional | `HS256` | Set `RS256` for asymmetric keys (then add `JWT_PUBLIC_KEY` + `JWT_PRIVATE_KEY` PEMs) |
| `JWT_ACCESS_TTL_MIN` | optional | `15` | Access token lifetime (minutes) |
| `JWT_REFRESH_TTL_DAYS` | optional | `30` | Refresh token lifetime (days) |
| `CORS_ALLOW_ORIGINS` | required prod | `*` (dev) | Comma-separated list of frontend origins |
| `ENVIRONMENT` | optional | `development` | `development` / `staging` / `production` |
| `LOG_LEVEL` | optional | `INFO` | `DEBUG`, `INFO`, `WARNING`, `ERROR` |

### Auth modules

**`auth-jwt`** (FastAPI):
```
JWT_SECRET=…
JWT_ALGORITHM=HS256
JWT_ACCESS_TTL_MIN=15
JWT_REFRESH_TTL_DAYS=30
```

**`auth-google` / `auth-github` / `auth-microsoft` / `auth-apple`** (OAuth providers):
```
GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
GOOGLE_REDIRECT_URI=https://api.example.com/auth/google/callback

GITHUB_CLIENT_ID=…
GITHUB_CLIENT_SECRET=…

MICROSOFT_CLIENT_ID=…
MICROSOFT_CLIENT_SECRET=…
MICROSOFT_TENANT_ID=common

APPLE_CLIENT_ID=…
APPLE_KEY_ID=…
APPLE_TEAM_ID=…
APPLE_PRIVATE_KEY_PEM=…   # the .p8 contents, newlines escaped as \n
```

**`auth-magic-link`**:
```
MAGIC_LINK_SECRET=…
MAGIC_LINK_TTL_MIN=15
EMAIL_FROM=noreply@example.com   # uses notif-email under the hood
```

**`auth-phone-otp`**:
```
TWILIO_ACCOUNT_SID=…
TWILIO_AUTH_TOKEN=…
TWILIO_VERIFY_SERVICE_SID=…
```

### Payment modules

**`payment-stripe`** (one-time charges):
```
STRIPE_SECRET_KEY=sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_SUCCESS_URL=https://example.com/payments/success
STRIPE_CANCEL_URL=https://example.com/payments/cancel
```

**`payment-stripe-subs`** (subscriptions — adds these on top of `payment-stripe`):
```
STRIPE_PRICE_TABLE_ID=prctbl_…   # optional, for the embedded price table
STRIPE_PORTAL_RETURN_URL=https://example.com/billing
```

**`payment-razorpay`**:
```
RAZORPAY_KEY_ID=rzp_live_…
RAZORPAY_KEY_SECRET=…
RAZORPAY_WEBHOOK_SECRET=…
```

**`payment-cod`** / **`payment-bank-transfer`** — no env vars (manual reconciliation).

### Notification modules

**`notif-email`** (Resend):
```
RESEND_API_KEY=re_…
EMAIL_FROM=noreply@example.com
EMAIL_REPLY_TO=support@example.com
```

**`notif-sms`** (Twilio):
```
TWILIO_ACCOUNT_SID=…
TWILIO_AUTH_TOKEN=…
TWILIO_FROM_NUMBER=+15555550100
```

**`notif-whatsapp`** (Twilio WhatsApp Business):
```
TWILIO_ACCOUNT_SID=…
TWILIO_AUTH_TOKEN=…
TWILIO_WHATSAPP_FROM=whatsapp:+14155238886
```

**`notifications-push`** (web push, VAPID):
```
VAPID_PUBLIC_KEY=…
VAPID_PRIVATE_KEY=…
VAPID_SUBJECT=mailto:ops@example.com
```

### Storage + media

**`media`** (asset metadata module; bring-your-own-CDN):
```
MEDIA_CDN_BASE_URL=https://cdn.example.com
MEDIA_UPLOAD_BUCKET=my-app-uploads
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=…
AWS_SECRET_ACCESS_KEY=…
```

### Realtime

**`ws-core`** (websockets):
```
WS_SECRET=…   # signing for handshake tokens
```

**`ws-redis`** (multi-pod pub/sub on top of ws-core):
```
REDIS_URL=redis://redis:6379/0
WS_CHANNEL_PREFIX=app
```

### Search

**`search-meili`** (Meilisearch):
```
MEILI_HOST=http://meili:7700
MEILI_MASTER_KEY=…
MEILI_INDEX_PREFIX=app
```

### AI

**`ai-llm`** (provider-agnostic LLM proxy):
```
LLM_PROVIDER=openai      # or anthropic | mistral | local
OPENAI_API_KEY=sk-…
ANTHROPIC_API_KEY=sk-ant-…
LLM_MODEL=gpt-4o-mini
LLM_MAX_TOKENS=2000
LLM_RATE_LIMIT_PER_TENANT_PER_HOUR=100
```

### Telemetry

**`telemetry-sentry`**:
```
SENTRY_DSN=https://…@sentry.io/…
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.2
```

**`telemetry-posthog`**:
```
POSTHOG_API_KEY=phc_…
POSTHOG_HOST=https://us.i.posthog.com
```

**`telemetry-plausible`**:
```
PLAUSIBLE_DOMAIN=example.com
PLAUSIBLE_API_HOST=https://plausible.io   # or self-hosted
```

### Ops

**`audit-log`** — no required env vars; uses `DATABASE_URL`.

**`feature-flags`**:
```
FEATURE_FLAGS_DEFAULT_ENV=production
FEATURE_FLAGS_REFRESH_SEC=30
```

**`backup`**:
```
BACKUP_S3_BUCKET=my-app-backups
BACKUP_S3_REGION=us-east-1
BACKUP_RETENTION_DAYS=30
BACKUP_SCHEDULE_CRON=0 3 * * *   # 3 AM daily
```

### Tenants

**`tenants`** (multi-workspace):
```
TENANT_INVITE_TOKEN_TTL_DAYS=7
TENANT_DEFAULT_ROLE=member
```

---

## 3 · Generated app — frontend

Next.js convention: only vars prefixed `NEXT_PUBLIC_` are exposed to the browser. Server-only vars stay private.

| Var | Required | Default | What it does |
|---|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | required | — | Backend URL — frontend hits this for all API calls |
| `NEXT_PUBLIC_APP_NAME` | optional | recipe `branding.name` | Override the rendered brand name |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | — | Browser-side Sentry (separate from backend DSN) |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | — | Browser-side PostHog |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | `https://us.i.posthog.com` | PostHog ingest URL |
| `NEXT_PUBLIC_PLAUSIBLE_DOMAIN` | optional | — | Plausible site domain |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | required if Stripe checkout in frontend | — | Stripe publishable key for client-side Stripe.js |
| `NEXTAUTH_SECRET` | required if next-auth | — | Session encryption secret |
| `NEXTAUTH_URL` | required if next-auth in prod | — | Canonical app URL |

---

## 4 · Putting it all together

A typical `.env` for an `observability-saas` starter (Sentry + PostHog + Plausible + Stripe + Tenants + Audit + Flags):

```ini
# === core ===
DATABASE_URL=postgresql://app:changeme@db:5432/app
JWT_SECRET=replace-with-openssl-rand-hex-32
CORS_ALLOW_ORIGINS=https://example.com
ENVIRONMENT=production
LOG_LEVEL=INFO

# === auth ===
GOOGLE_CLIENT_ID=…
GOOGLE_CLIENT_SECRET=…
GOOGLE_REDIRECT_URI=https://api.example.com/auth/google/callback

# === payment ===
STRIPE_SECRET_KEY=sk_live_…
STRIPE_WEBHOOK_SECRET=whsec_…
STRIPE_PRICE_TABLE_ID=prctbl_…

# === notif ===
RESEND_API_KEY=re_…
EMAIL_FROM=noreply@example.com

# === telemetry ===
SENTRY_DSN=https://…@sentry.io/…
SENTRY_ENVIRONMENT=production
POSTHOG_API_KEY=phc_…
PLAUSIBLE_DOMAIN=example.com

# === tenants + ops ===
TENANT_INVITE_TOKEN_TTL_DAYS=7
FEATURE_FLAGS_DEFAULT_ENV=production

# === frontend (NEXT_PUBLIC_) ===
NEXT_PUBLIC_API_BASE_URL=https://api.example.com
NEXT_PUBLIC_SENTRY_DSN=https://…@sentry.io/…
NEXT_PUBLIC_POSTHOG_KEY=phc_…
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=example.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_…
```

The wirer emits a `.env.example` alongside generated apps listing every var the chosen modules need — copy it to `.env` and fill in the blanks.

---

## Secret-generation cheat-sheet

```bash
# 64-char hex secret (JWT_SECRET, session signing, etc.)
openssl rand -hex 32

# Base64 64-byte secret (some libs prefer this)
openssl rand -base64 48

# VAPID keypair for web push
npx web-push generate-vapid-keys

# AWS access key
aws iam create-access-key --user-name my-app-uploader

# RSA keypair for JWT RS256
openssl genrsa -out jwt-private.pem 2048
openssl rsa -in jwt-private.pem -pubout -out jwt-public.pem
```

## Per-environment guidance

| Env | What to set | Source |
|---|---|---|
| **local dev** | Copy `.env.example` to `.env`. Use Stripe **test** keys, SQLite (`DATABASE_URL=sqlite:///./app.db`), `ENVIRONMENT=development`. | hand-edited |
| **staging** | Same as prod but with `staging` suffixes (Sentry env, S3 bucket, etc.) and `_test_` API keys | secret manager |
| **production** | All secrets in a vault (AWS SM, GCP SM, 1Password, Doppler, Infisical). Never commit `.env`. | secret manager |

The wirer always emits `.env` to `.gitignore` automatically.

---

## Next docs

- [LOCAL-SETUP.md](./LOCAL-SETUP.md) — first-time setup
- [DEPLOYMENT.md](./DEPLOYMENT.md) — Vercel/Render/Fly recipes
- [DOCKER-COMPOSE.md](./DOCKER-COMPOSE.md) — full stack compose
