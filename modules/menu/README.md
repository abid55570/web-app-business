# menu — public catalog + admin CRUD

Implements `menu@v1`. Dual-router pattern: public + admin.

## Wirer placement

| Source | Destination |
|---|---|
| `backend/fastapi/router.py` | `<out>/backend/app/menu/router.py` |
| `backend/fastapi/service.py` | `<out>/backend/app/menu/service.py` |
| `backend/fastapi/model.py` | `<out>/backend/app/menu/model.py` |
| `backend/fastapi/schemas.py` | `<out>/backend/app/menu/schemas.py` |
| `frontend/nextjs/lib/api/menu.ts` | `<out>/frontend/src/lib/api/menu.ts` |
| `schema.prisma` | appended to `<out>/prisma/schema.prisma` |

`backend_routers` manifest field tells the wirer to mount BOTH routers:
- `public_router` at `/api` (no auth)
- `admin_router` at `/api/admin` (auth required)

## Endpoints

### Public
- `GET /api/menu[?category=...]` — list available items
- `GET /api/menu/categories` — distinct categories (filtered to available)
- `GET /api/menu/{id}` — item detail (404 if unavailable)

### Admin (auth required)
- `GET /api/admin/menu` — list all (incl. unavailable)
- `POST /api/admin/menu` — create
- `PATCH /api/admin/menu/{id}` — partial update
- `PATCH /api/admin/menu/{id}/availability` — toggle availability
- `DELETE /api/admin/menu/{id}` — hard delete
