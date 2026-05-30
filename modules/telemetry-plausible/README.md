# telemetry-plausible

Implements `telemetry-plausible@v1`. Plausible web-analytics adapter.
Privacy-first — no cookies, no fingerprinting, no GDPR consent banner
required.

## Endpoints (`/api/telemetry/plausible/*`)

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/health` | none | `{ enabled, host, domain }`. |
| POST | `/goal` | signed-in | Server-side custom event. Body `{ name, url, props? }`. |

## Frontend script tag

```ts
import { plausibleScriptTag } from '@/lib/api/telemetry-plausible'

// In your Next.js root layout:
<head>
  <Script
    defer
    data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN!}
    src="https://plausible.io/js/script.js"
  />
</head>
```

Or just call the helper to build the tag string:

```ts
plausibleScriptTag({ domain: 'acme.com' })
// → <script defer data-domain="acme.com" src="https://plausible.io/js/script.js"></script>
```

## Env

- `PLAUSIBLE_DOMAIN` — required. Domain registered in Plausible (e.g. `acme.com`).
- `PLAUSIBLE_API_HOST` — overrides `https://plausible.io` for self-hosted Plausible.

## Pairs with

- `telemetry-sentry` (optional) — errors via Sentry, pageviews via Plausible.
- `telemetry-posthog` (optional) — both can run side-by-side; Plausible for SEO/pageviews, PostHog for funnels.
