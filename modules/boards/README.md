# boards

Implements `boards@v1`. Personal kanban-style boards. Each Board is owned by
exactly one user and contains Cards. Columns are a per-board ordered list of
status strings (e.g. `["todo", "doing", "done"]`) so card movements are just
status + position updates — no separate Column table to wrangle.

Single-router pattern: every endpoint requires a signed-in user; ownership
is enforced in the service layer (caller must be the board owner). There's
no admin surface in v1.

## Endpoints (all `/api/*`, all require signed-in user)

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/boards` | List my boards. |
| POST | `/boards` | Create board. Default columns: `["todo","doing","done"]`. |
| GET | `/boards/{slug_or_id}` | Detail view with embedded cards. |
| PATCH | `/boards/{id}` | Update name / slug / description / columns. |
| DELETE | `/boards/{id}` | Cascades cards. |
| POST | `/boards/{id}/cards` | Create card. `status` must match a board column. |
| PATCH | `/boards/cards/{card_id}` | Edit title / body / assignee / due. |
| PATCH | `/boards/cards/{card_id}/move` | Atomically update `status` + `position`. |
| DELETE | `/boards/cards/{card_id}` | Delete card. |

## Events emitted

- `boards.created`     `{ id, ownerId, slug }`
- `boards.deleted`     `{ id }`
- `boards.card.created` `{ id, boardId, status }`
- `boards.card.moved`   `{ id, boardId, fromStatus, toStatus }`
- `boards.card.deleted` `{ id, boardId }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `default_columns` | `["todo","doing","done"]` | Wired into UI defaults; service falls back to this when `columns` is omitted at create time. |
| `max_cards_per_board` | `500` | Server-side hard cap. Returns `CARD_LIMIT_REACHED` (409). |

## Why columns-as-CSV (not array)

SQLite + MySQL don't share a portable native array type. CSV in a String
column keeps the schema portable across Postgres / MySQL / SQLite, and the
service splits/joins on the way in and out. Frontend always sees a JSON
array.

## Used by

- `kanban-board` starter (single-user productivity).
- Wave 4 candidate `crm-pipeline-board` (replace the existing list view).
