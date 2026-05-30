# audit-log changelog

Severity tags follow Phase-10-wave-3 conventions — `safe` / `review` /
`breaking`. `b-dash upgrade` parses this file to surface change categories
before the regen replaces the customer's app.

## 1.0.0

### safe
- Initial release. Append-only audit trail + admin filtered read.
- POST `/api/audit` records the actor / action / target / metadata.
- GET `/api/admin/audit` supports filters: actor, action, targetType, targetId, from, to, limit.
