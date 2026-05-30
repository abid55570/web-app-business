# feature-flags

Implements `feature-flags@v1`. Server-side feature flags with three
resolution layers:

1. **Kill switch** — `enabled=false` returns False for everyone.
2. **Audience match** — exact match against the flag's `audiences[]` list.
3. **Rollout %** — deterministic hash bucket on `(key, audience)`.

Audience keys are free-form strings — `tenant:abc`, `user:xyz`, anything
the caller picks. The check endpoint takes one audience per request so
callers mix-and-match scopes freely.

## Endpoints

Public (`/api`, no auth):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/feature-flags/check/{key}?audience=<key>` | Resolves to `{ key, enabled, audience }`. Unknown keys return `enabled=false`. |
| GET | `/feature-flags?audience=<key>` | Resolved snapshot — only `{ key, enabled }` per row, no rollout % leaks to client. |

Admin (`/api/admin`, role ∈ `{admin, owner}`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/feature-flags` | Full list (incl. rollout %, audiences). |
| POST | `/feature-flags` | Create. Key must match `[a-z0-9][a-z0-9._-]*` and be unique. |
| PATCH | `/feature-flags/{id}` | Toggle / change rollout / change audiences / edit description. |
| DELETE | `/feature-flags/{id}` | Remove. |

## Resolution order (in `service.resolve`)

```
1. flag.enabled == False      → False  (kill switch wins everything)
2. audience in flag.audiences → True   (explicit allow-list)
3. rolloutPercent >= 100      → True
4. rolloutPercent > 0 + hash(key:audience) % 100 < rolloutPercent → True
5. rolloutPercent == 0 + audiences empty → True (enabled-for-everyone)
6. Default → False
```

Hash is **SHA1(`<key>:<audience>`)** truncated to 8 hex chars (mod 100).
Same `(key, audience)` pair always lands in the same bucket — restart-safe.

## Events emitted

- `feature-flags.created`  `{ id, key }`
- `feature-flags.updated`  `{ id, key, enabled }`
- `feature-flags.deleted`  `{ id, key }`

## Usage example

```ts
import { featureFlagsApi } from '@/lib/api/feature-flags'

const { enabled } = await featureFlagsApi.check('billing-v2', `tenant:${currentTenant.slug}`)
if (enabled) renderBillingV2()
else renderBillingV1()
```

```python
from app.feature_flags.service import resolve

if await resolve(db, key="billing-v2", audience=f"tenant:{tenant.slug}"):
    return new_billing_flow(...)
return old_billing_flow(...)
```
