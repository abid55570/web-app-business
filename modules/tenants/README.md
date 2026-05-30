# tenants

Implements `tenants@v1`. Multi-tenancy primitive — registry of Tenants +
TenantMembers with role gates (owner/admin/member). Other modules opt-in
to tenant scoping by reading the current tenant via the
`app.tenants.current.get_current_tenant` helper (X-Tenant header).

v1 ships the registry. v2 will ship a middleware that auto-scopes other
modules' queries by `tenant_id` without manual rewrites.

## Endpoints (single router at `/api`, all auth required)

| Method | Path | Role | Behaviour |
| --- | --- | --- | --- |
| GET | `/tenants/my` | signed-in | Tenants I belong to. |
| POST | `/tenants` | signed-in | Create. Caller becomes owner + first member. |
| GET | `/tenants/{slug_or_id}` | member | Detail. |
| PATCH | `/tenants/{id}` | owner | Edit name / slug / plan. |
| GET | `/tenants/{id}/members` | member | Member list. |
| POST | `/tenants/{id}/members` | owner / admin | Idempotent invite. |
| PATCH | `/tenants/{id}/members/{userId}` | owner | Change role. Owner cannot be demoted. |
| DELETE | `/tenants/{id}/members/{userId}` | owner / admin / self | Remove. Owner cannot be removed. |

## Events emitted

- `tenants.created`              `{ id, ownerId, slug }`
- `tenants.member.invited`       `{ tenantId, userId, role, invitedBy }`
- `tenants.member.removed`       `{ tenantId, userId }`
- `tenants.member.role-changed`  `{ tenantId, userId, role }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `max_members_per_tenant` | `100` | Returns `TENANT_MEMBER_LIMIT` (409) on overflow. |
| `default_plan` | `"free"` | Stamped on new tenants. |

## Current-tenant helper (FastAPI)

```python
from app.tenants.current import CurrentTenant

@router.get("/api/widgets")
async def list_widgets(tenant: CurrentTenant, ...):
    # tenant.id is now safe to filter on
    ...
```

Reads `X-Tenant: <slug>` from the request, resolves the Tenant, asserts
caller is a member, returns the Tenant. Raises 400 if header missing,
404 if unknown, 403 if caller isn't a member.

## Used by

- `multi-tenant-saas` starter — workspaces + invite UX out of the box.
