# media

Implements `media@v1`. Media asset registry — tracks user-uploaded images /
videos / files by URL + metadata. **v1 stores metadata only** — callers
upload to S3 (or any HTTPS endpoint) directly, then POST the resulting URL
+ dims + size + mime here to register the asset.

v2 will ship a multipart upload helper + thumbnail generation.

## Endpoints

Single router at `/api`. Reads are public; writes require auth + owner.

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/media[?ownerId=&kind=]` | none | Public list with optional filters. |
| GET | `/media/{id}` | none | Public detail. |
| GET | `/media/my` | signed-in | Caller's own assets. |
| POST | `/media` | signed-in | Register metadata. `ownerId` stamped from auth context. |
| PATCH | `/media/{id}` | owner | Edit `altText` / `thumbUrl`. |
| DELETE | `/media/{id}` | owner | Delete. |

## Events emitted

- `media.registered` `{ id, ownerId, kind, url }`
- `media.deleted`    `{ id }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `max_size_bytes` | `26214400` (25 MiB) | Server enforces a 422 on register. |

## Used by

- `media-portfolio` starter — public read renders unauthenticated portfolio.
- Wire alongside `posts` to attach hero images.
