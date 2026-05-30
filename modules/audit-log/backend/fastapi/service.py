"""audit-log business logic — append-only writes, indexed reads.

Other modules call `record(...)` from their handlers to log sensitive
operations. The function is the cheapest possible surface: one INSERT,
no read-modify-write, no foreign keys. Failures are swallowed by callers
so a flaky audit table never breaks the calling op.
"""
import json
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.events_bus.bus import bus
from app.audit_log.model import AuditEntry


async def record(
    db: AsyncSession,
    *,
    actor_id: str,
    action: str,
    target_type: str | None = None,
    target_id: str | None = None,
    metadata: dict | None = None,
    ip: str | None = None,
    user_agent: str | None = None,
) -> AuditEntry:
    entry = AuditEntry(
        actor_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        metadata_json=json.dumps(metadata or {}),
        ip_address=ip,
        user_agent=user_agent,
    )
    db.add(entry)
    await db.commit()
    await db.refresh(entry)
    await bus.emit(
        "audit.recorded",
        {
            "id": entry.id,
            "actorId": entry.actor_id,
            "action": entry.action,
            "targetType": entry.target_type,
            "targetId": entry.target_id,
        },
    )
    return entry


async def list_for_admin(
    db: AsyncSession,
    *,
    actor_id: str | None = None,
    action: str | None = None,
    target_type: str | None = None,
    target_id: str | None = None,
    from_at: datetime | None = None,
    to_at: datetime | None = None,
    limit: int = 200,
) -> list[AuditEntry]:
    stmt = select(AuditEntry).order_by(AuditEntry.created_at.desc()).limit(limit)
    if actor_id:
        stmt = stmt.where(AuditEntry.actor_id == actor_id)
    if action:
        stmt = stmt.where(AuditEntry.action == action)
    if target_type:
        stmt = stmt.where(AuditEntry.target_type == target_type)
    if target_id:
        stmt = stmt.where(AuditEntry.target_id == target_id)
    if from_at:
        stmt = stmt.where(AuditEntry.created_at >= from_at)
    if to_at:
        stmt = stmt.where(AuditEntry.created_at <= to_at)
    return list((await db.execute(stmt)).scalars())
