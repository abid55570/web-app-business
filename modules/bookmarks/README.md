# bookmarks

Implements `bookmarks@v1`. Polymorphic personal saves — ties one user to one
`(targetType, targetId)` pair with an optional private note. Fourth
primitive in the polymorphic-target family, after `comments` / `tags` /
`likes`.

**Private by design.** Unlike `likes`, there is no public count or "who
saved this" lookup — every endpoint requires the caller to be the owner of
the bookmark.

## Endpoints

Single router at `/api`. All require a signed-in user.

| Method | Path | Behaviour |
| --- | --- | --- |
| POST | `/bookmarks` (body: `{ targetType, targetId, note? }`) | Idempotent — if already saved, updates `note`. |
| DELETE | `/bookmarks?targetType=…&targetId=…` | Idempotent. |
| GET | `/bookmarks/check?targetType=…&targetId=…` | `{ bookmarked: bool }` |
| GET | `/bookmarks/my[?targetType=…]` | Caller's own saves, newest first. |

## Events emitted

- `bookmarks.added`   `{ userId, targetType, targetId }`
- `bookmarks.removed` `{ userId, targetType, targetId }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `max_note_length` | `1000` | Server-side validation cap on the optional `note`. |

## Compared to `likes`

| | `likes` | `bookmarks` |
| --- | --- | --- |
| Aggregate counts | yes (public) | **no** |
| `likedByMe` / `bookmarked` lookup | both | both |
| Anon read | yes (count only) | **no** |
| Note / metadata | none | optional `note` |
| Semantic | upvote / endorse | save for later |

## Used by

- `bookmarks-app` starter (personal reading list).
- Wire into any `posts`-based starter to add "save for later" alongside likes.
