"""backup business logic — pg_dump / mysqldump → S3.

The shipped `_do_dump()` + `_do_upload()` helpers are stubs so tests pass
without postgres + boto3 + a live bucket. Replace in production with:

    proc = await asyncio.create_subprocess_exec(
        "pg_dump", dsn, "--no-owner", stdout=asyncio.subprocess.PIPE
    )
    bytes_, _ = await proc.communicate()
    boto3.client("s3").put_object(Bucket=..., Key=key, Body=bytes_)
"""
from __future__ import annotations

import logging
import os
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.backup.model import BackupJob


logger = logging.getLogger(__name__)


class BackupError(AppError):
    """Raised by the backup service."""


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def _do_dump(db_url: str) -> bytes:
    """Stub — real impl shells out to pg_dump / mysqldump."""
    logger.info("backup stub _do_dump db_url=%s", _redact(db_url))
    return b"-- stub dump --\n"


async def _do_upload(*, bucket: str, key: str, data: bytes) -> int:
    """Stub — real impl uses boto3.client('s3').put_object(...). Returns
    the byte count uploaded."""
    logger.info("backup stub _do_upload bucket=%s key=%s size=%d", bucket, key, len(data))
    return len(data)


def _redact(url: str) -> str:
    if "@" not in url:
        return "***"
    head, tail = url.split("@", 1)
    if "://" in head:
        scheme, _ = head.split("://", 1)
        return f"{scheme}://***@{tail}"
    return f"***@{tail}"


async def trigger(db: AsyncSession, *, kind: str = "manual") -> BackupJob:
    job = BackupJob(kind=kind, status="queued")
    db.add(job)
    await db.commit()
    await db.refresh(job)
    await bus.emit("backup.queued", {"id": job.id, "kind": job.kind})
    return job


async def run_job(db: AsyncSession, job_id: str) -> BackupJob:
    """Synchronously execute a queued job. Callers (worker / admin
    trigger) await this; failures are recorded on the row, never raised."""
    job = (
        await db.execute(select(BackupJob).where(BackupJob.id == job_id))
    ).scalar_one_or_none()
    if job is None:
        raise BackupError("BACKUP_NOT_FOUND", "Job not found.", status_code=404)

    job.status = "running"
    job.started_at = _utcnow()
    await db.commit()

    bucket = os.getenv("BACKUP_S3_BUCKET")
    if not bucket:
        return await _fail(db, job, reason="BACKUP_S3_BUCKET not set")

    db_url = os.getenv("BACKUP_DB_URL") or os.getenv("DATABASE_URL")
    if not db_url:
        return await _fail(db, job, reason="DATABASE_URL not set")

    try:
        data = await _do_dump(db_url)
        ts = _utcnow().strftime("%Y%m%dT%H%M%SZ")
        key = f"backups/{ts}-{job.id}.sql"
        size = await _do_upload(bucket=bucket, key=key, data=data)
        job.status = "succeeded"
        job.s3_key = key
        job.size_bytes = size
        job.finished_at = _utcnow()
        await db.commit()
        await db.refresh(job)
        await bus.emit(
            "backup.succeeded",
            {"id": job.id, "sizeBytes": size, "s3Key": key},
        )
        return job
    except Exception as e:  # noqa: BLE001
        return await _fail(db, job, reason=str(e)[:500])


async def _fail(db: AsyncSession, job: BackupJob, *, reason: str) -> BackupJob:
    job.status = "failed"
    job.reason = reason
    job.finished_at = _utcnow()
    await db.commit()
    await db.refresh(job)
    await bus.emit("backup.failed", {"id": job.id, "reason": reason})
    return job


async def list_jobs(
    db: AsyncSession, *, status: str | None = None, limit: int = 100
) -> list[BackupJob]:
    stmt = select(BackupJob).order_by(BackupJob.created_at.desc()).limit(limit)
    if status:
        stmt = stmt.where(BackupJob.status == status)
    return list((await db.execute(stmt)).scalars())


async def purge_old(db: AsyncSession, *, retention_days: int = 30) -> int:
    """Delete successful jobs older than `retention_days`. Returns count
    purged. Failed jobs are kept indefinitely for forensics."""
    cutoff = _utcnow() - timedelta(days=retention_days)
    stmt = select(BackupJob).where(
        BackupJob.status == "succeeded", BackupJob.created_at < cutoff
    )
    rows = list((await db.execute(stmt)).scalars())
    for row in rows:
        await db.delete(row)
    if rows:
        await db.commit()
    return len(rows)


async def run_due_jobs(db: AsyncSession) -> list[BackupJob]:
    """Intended entry point for cron — picks every queued job and runs
    it. Production deployments call this from a scheduled task."""
    queued = await list_jobs(db, status="queued")
    results = []
    for j in queued:
        results.append(await run_job(db, j.id))
    return results
