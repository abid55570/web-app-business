# likes

Implements `likes@v1`. Polymorphic upvotes — one `Like` row ties a user to
a `(targetType, targetId)` pair. Third primitive in the polymorphic-target
family, after `comments` and `tags`.

## Endpoints

Single router at `/api`:

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| POST | `/likes` (body: `{ targetType, targetId }`) | signed-in user | Toggles: like if absent, unlike if present. Returns `{ liked, count }`. |
| DELETE | `/likes?targetType=…&targetId=…` | signed-in user | Explicit unlike. Idempotent. Returns same shape. |
| GET | `/likes/for-target?targetType=…&targetId=…` | anonymous OK | `{ count, likedByMe }`. `likedByMe` only true when a valid bearer token is sent. |
| GET | `/likes/my[?targetType=…]` | signed-in user | The caller's own likes. |

## Events emitted

- `likes.added`   `{ userId, targetType, targetId }`
- `likes.removed` `{ userId, targetType, targetId }`

## Design notes

- DB-level `UNIQUE(user_id, target_type, target_id)` enforces no-double-likes.
- Toggle = read existing → flip; counted in one round trip via SQL `COUNT(*)`.
- Anonymous reads return `likedByMe=false` without raising — frontend can
  render heart buttons before login finishes.

## Used by

- Wire `targetType="post"` to drive post upvotes (`social-feed`, `community-forum`).
- Wire `targetType="comment"` for comment upvotes (any commenting starter).
- Wire `targetType="product"` for product wishlist behaviour.
