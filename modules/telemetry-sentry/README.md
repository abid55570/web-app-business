# telemetry-sentry

Implements `telemetry-sentry@v1`. Sentry adapter — error + performance
tracking on the backend and the browser.

FastAPI-only in v1. Django adapter (`sentry_sdk.integrations.django`)
ships in wave 2.

## Endpoints

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/api/telemetry/sentry/health` | none | `{ initialized: bool }`. Indirectly confirms `SENTRY_DSN` is wired. |
| POST | `/api/telemetry/sentry/capture` | admin | Synthetic event for verifying the integration end-to-end. |

## Backend hooks

```python
from app.telemetry_sentry.client import set_user_context, capture_exception

# In your auth middleware
set_user_context(user_id=current_user.id, email=current_user.email)

# In a try/except around a flaky 3rd-party call
try:
    await stripe.charges.create(...)
except StripeError as e:
    capture_exception(e, fingerprint="stripe.charges.create")
    raise
```

## Frontend init

```ts
import { initBrowserSentry } from '@/lib/api/telemetry-sentry'

initBrowserSentry({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN!,
  environment: process.env.NEXT_PUBLIC_RUNTIME_ENV ?? 'production',
  sampleRate: 1.0,
})
```

The shipped impl is a stub (logs to console + sets a `window.__sentryInit`
marker). Replace `initBrowserSentry` + `client.py` helpers with the real
`@sentry/nextjs` / `sentry_sdk` SDK calls in production.

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `sample_rate` | `1.0` | Fraction of events reported. |
| `traces_sample_rate` | `0.1` | Fraction of HTTP transactions reported as perf traces. |

## Env

- `SENTRY_DSN` — required. Sentry project DSN.
- `SENTRY_ENVIRONMENT` — production / staging / dev (defaults to `RUNTIME_ENV`).
- `SENTRY_RELEASE` — usually the git sha.

## Pairs with

- `audit-log` (optional) — capture audit-recorded admin actions on the side.
- `telemetry-posthog` (optional) — co-exist; PostHog handles product events, Sentry handles errors.
