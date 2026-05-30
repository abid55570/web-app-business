# tags

Implements `tags@v1`. Polymorphic taxonomy — a `Tag` is an admin-curated
label, a `TagAssignment` pins one tag to any `(targetType, targetId)` pair.
Same trick as `comments`: any module can attach tags without a schema
migration on the target side.

## Endpoints

Public (`/api`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/tags` | List all tags (sorted by slug). |
| GET | `/tags/by-slug/{slug}` | Resolve a slug. |
| GET | `/tags/for-target?targetType=…&targetId=…` | Tags on a single target. |
| GET | `/tags/{id}/targets?targetType=…` | Targets carrying this tag (refs only — caller fetches the actual targets). |

Admin (`/api/admin`, role ∈ `{admin, owner}`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET / POST | `/tags` | List + create. |
| PATCH / DELETE | `/tags/{id}` | Update + delete (cascades assignments). |
| POST | `/tags/assign` (body: `tagId/targetType/targetId`) | Idempotent — same tuple twice = no-op. |
| DELETE | `/tags/assign?tagId=…&targetType=…&targetId=…` | Idempotent. |

## Events emitted

- `tags.created`   `{ id, slug }`
- `tags.updated`   `{ id }`
- `tags.deleted`   `{ id }`
- `tags.assigned`  `{ tagId, targetType, targetId }`
- `tags.unassigned` `{ tagId, targetType, targetId }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `max_tags_per_target` | `16` | Returns `TAG_LIMIT_REACHED` (409) once hit. |

## Pairing

- `posts` — wire tags via `targetType="post"`; render a tag pill on each post via `tags.forTarget('post', slug)`.
- `boards` — categorise cards via `targetType="card"`.
- `comments` — flag/categorise reports via `targetType="comment"`.

## Used by

- `tagged-blog` starter (posts + tags).
- Wave 5+ candidates: `tagged-forum`, `tagged-product-reviews`.
