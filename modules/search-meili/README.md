# search-meili

Implements `search-meili@v1`. Typo-tolerant full-text search powered by
Meilisearch. Public read (`/api/search/{index}`), admin write
(`/api/admin/search/index`).

Documents are arbitrary JSON keyed by `documentId` — the module stays
domain-agnostic. Other modules subscribe to bus events (e.g. `posts.published`)
to keep their index in sync.

## Endpoints

| Method | Path | Auth | Behaviour |
| --- | --- | --- | --- |
| GET | `/api/search/{index}?q=&limit=&offset=` | none | Search hits with paging. Empty `q` lists all. |
| POST | `/api/admin/search/index` | admin | `{ index, documentId, document }` upsert. |
| DELETE | `/api/admin/search/index` | admin | `{ index, documentId }` remove. |
| GET | `/api/admin/search/stats` | admin | `{ host, indexes: { name → { documents } } }`. |

## Events emitted

- `search.indexed`  `{ index, documentId }`
- `search.removed`  `{ index, documentId }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `meili_host` | `http://localhost:7700` | Override via `MEILI_HOST` env. |
| `search_timeout_ms` | `500` | Hard cap per request. |

## Env

- `MEILI_HOST` — overrides config knob.
- `MEILI_MASTER_KEY` — required when Meili runs with auth enabled.

## Local-only fallback

The shipped client is a deterministic in-memory store so smoke tests
pass without a running Meilisearch. Production swap = 3 function bodies
in `app/search_meili/client.py`:

```python
import meilisearch_python_async as meili

_client = meili.AsyncClient(host(), master_key())

async def upsert(index, doc_id, document):
    await _client.index(index).add_documents([{**document, "id": doc_id}])

async def delete(index, doc_id):
    await _client.index(index).delete_document(doc_id)

async def search(index, query, limit=20, offset=0, filters=None):
    res = await _client.index(index).search(query, limit=limit, offset=offset)
    return {
        "hits": res.hits,
        "total": res.estimated_total_hits,
        "processingTimeMs": res.processing_time_ms,
        "query": query,
        "offset": offset,
        "limit": limit,
    }
```

## Pairs with

- `posts` — subscribe to `posts.published` to push into the `posts` index.
- `menu` — subscribe to `menu.item.created` / `.updated` / `.availability-changed`.
- `media` — subscribe to `media.registered` for image alt-text + tag search.
