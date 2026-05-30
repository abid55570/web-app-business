# posts

Implements `posts@v1`. Generic content posts — author-owned, slug-addressable,
status-controlled (draft / published / archived). Use as a building block for
blogs, social feeds, community forums, changelogs, and roadmap pages.

## Endpoints

Public (`/api`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/posts` | List posts with `status=published`. Filter by `?authorId=…`. |
| GET | `/posts/{slug}` | Fetch a single published post by slug. 404 on draft/archived. |

Admin (`/api/admin`, requires role ∈ `{admin, owner}`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/posts` | List everything. Filter by `?status=…`. |
| POST | `/posts` | Create. `authorId` is stamped from the auth context; never accepted from the body. |
| GET | `/posts/{id}` | Fetch any post. |
| PATCH | `/posts/{id}` | Partial update. Slug uniqueness enforced. |
| PATCH | `/posts/{id}/status` | Transition status. First transition to `published` stamps `publishedAt`; later transitions do not reset it. |
| DELETE | `/posts/{id}` | Delete. |

## Events emitted

- `posts.created`  `{ id, authorId, slug }`
- `posts.published`  `{ id, slug }` (on create-with-published or first transition)
- `posts.updated`  `{ id, slug }`
- `posts.deleted`  `{ id }`

Subscribe via `events-bus` from any other module (e.g. trigger a search
re-index, fan out a notification on publish, …).

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `default_status` | `"draft"` | Status assigned to newly created posts. |
| `hide_drafts_from_public` | `true` | Public list filters out non-published items. |

## Slug rules

`^[a-z0-9][a-z0-9-]*$` — kebab-case, must start with alphanumeric.

## Use in starters

- `social-feed` — posts power user feed
- `content-blog` — long-form articles (once wave 4 lands)
- `community-forum` — posts are top-level threads

Pair with `notifications` to email subscribers on publish via the
`posts.published` event.
