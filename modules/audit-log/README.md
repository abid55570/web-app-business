# audit-log

Implements `audit-log@v1`. Append-only audit trail for sensitive
operations. Other modules call `app.audit_log.service.record(...)` from
their handlers; admins read via `/api/admin/audit` with filters.

## Endpoints

Public (`/api`, auth required):

| Method | Path | Behaviour |
| --- | --- | --- |
| POST | `/audit` | Record an entry. `actorId` stamped from auth; `ip` + `userAgent` stamped from request. |

Admin (`/api/admin`, role ∈ `{admin, owner}`):

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/audit?actorId=&action=&targetType=&targetId=&from=&to=&limit=` | Filtered list (newest first). `limit` capped at 1000. |

## Events emitted

- `audit.recorded` `{ id, actorId, action, targetType, targetId }`

## Config knobs

| Key | Default | Notes |
| --- | --- | --- |
| `retention_days` | `365` | v1 marker — entries past this are eligible for archival. No auto-delete yet. |

## Calling from another module

```python
from app.audit_log.service import record

await record(
    db,
    actor_id=user.id,
    action="tenant.invite",
    target_type="tenant",
    target_id=tenant.id,
    metadata={"invited_user_id": new_member.id, "role": "admin"},
)
```

Wrap in `try/except` if the caller cares about its own response even when
the audit table is flaky:

```python
try:
    await record(db, actor_id=user.id, action="x", ...)
except Exception:
    pass  # audit failures must not break the calling op
```

## Roadmap

v2 will ship:

- Tamper-evident hash chain (each entry stores SHA256 of `(prev_hash, payload)`)
- Scheduled export to S3 / Glacier for compliance
- Optional structured-search via `search-meili`
