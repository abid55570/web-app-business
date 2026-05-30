# comments

Implements `comments@v1`. Generic comment thread that attaches to any
addressable target via `(targetType, targetId)` — e.g. `post:hello-world`,
`issue:42`, `ticket:abc`. No FK to the target, so any module can use it
without a schema migration.

Optional `parentId` enables one level of nested replies; the parent must
scope to the same target.

## Endpoints

Public (`/api`):

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/comments?targetType=…&targetId=…` | none | Returns `status=visible` only. |
| POST | `/comments` | signed-in user | Stamps `authorId` from auth context. |
| PATCH | `/comments/{id}` | author only | Update body. |
| DELETE | `/comments/{id}` | author only | Hard delete. |

Admin (`/api/admin`, requires role ∈ `{admin, owner}`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/comments?status=…&targetType=…` | Full list, optional filters. |
| PATCH | `/comments/{id}/status` | Transition between `visible / hidden / flagged`. |
| DELETE | `/comments/{id}` | Hard delete. |

## Events emitted

- `comments.created`  `{ id, targetType, targetId, authorId }`
- `comments.updated`  `{ id }` (also fired on moderation)
- `comments.hidden`   `{ id }` (visible → hidden | flagged)
- `comments.deleted`  `{ id }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `max_body_length` | `2000` | Server-side length cap. Wire the same limit to UI. |
| `allow_nested_replies` | `true` | When false, `parentId` is rejected with `COMMENT_NESTING_DISABLED`. |

## Pairing

- `posts` — pin comments to `targetType="post"`.
- `notifications` — subscribe to `comments.created` to email post authors.
- `support-ticket` (future) — pin comments to `targetType="ticket"`.

## Used by

- `social-feed` — engagement under posts.
- `community-forum` — threaded discussion.
