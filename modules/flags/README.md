# flags

Implements `flags@v1`. Moderation reports — 5th primitive in the
polymorphic-target family. Any signed-in user can flag any
`(targetType, targetId)` with a `reason`; admins triage via a queue.

## Endpoints

Public (`/api`):

| Method | Path | Behaviour |
| --- | --- | --- |
| POST | `/flags` | Open a flag. Auth required. Idempotent per (reporter, target). |

Admin (`/api/admin`, role ∈ `{admin, owner}`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/flags?status=open&targetType=post` | Moderation queue with optional filters. |
| GET | `/flags/for-target?targetType=…&targetId=…` | All flags on one target. |
| PATCH | `/flags/{id}` (body: `{ status, resolverNote? }`) | Resolve or dismiss. Stamps `resolverId` from auth context. |

## Reasons (closed set)

`spam` · `abuse` · `off-topic` · `illegal` · `other` — anything else returns
400 `FLAG_REASON_INVALID`.

## Events emitted

- `flags.opened`    `{ id, targetType, targetId, reporterId, reason }`
- `flags.resolved`  `{ id, resolverId }`
- `flags.dismissed` `{ id, resolverId }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `allowed_reasons` | `["spam","abuse","off-topic","illegal","other"]` | Server enforces this set on create. |
