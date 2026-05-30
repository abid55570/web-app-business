# telemetry-posthog

Implements `telemetry-posthog@v1`. PostHog product-analytics adapter.

## Endpoints (`/api/telemetry/posthog/*`)

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/health` | none | `{ enabled, host }`. |
| POST | `/track` | signed-in | Body `{ event, distinctId?, properties? }`. `distinctId` defaults to current user id. |

## Server-side track

```python
from app.telemetry_posthog.client import track

await track(
    event="subscription.upgraded",
    distinct_id=tenant.slug,
    properties={"from_plan": "free", "to_plan": "pro"},
)
```

Fire-and-forget — never raises. Returns `delivered` / `dropped` / `disabled`.

## Browser

```ts
import { initBrowserPosthog } from '@/lib/api/telemetry-posthog'

initBrowserPosthog({
  apiKey: process.env.NEXT_PUBLIC_POSTHOG_API_KEY!,
  host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  capturePageviews: true,
  captureClicks: false,
})
```

Stub today; swap to `posthog-js` SDK in prod.

## Env

- `POSTHOG_API_KEY` — `phc_…` project API key.
- `POSTHOG_HOST` — defaults to `https://us.posthog.com`. EU customers set `https://eu.posthog.com`.

## Pairs with

- `telemetry-sentry` (optional) — errors via Sentry, events via PostHog.
- `audit-log` (optional) — mirror sensitive admin actions to both.
