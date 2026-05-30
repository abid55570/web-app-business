# backup

Implements `backup@v1`. Scheduled DB dumps + on-demand snapshots to
S3-compatible storage. Stores a `BackupJob` row per attempt so admins
can audit + restore.

Worker hook: `app.backup.service.run_due_jobs(db)` is intended to be
called by a cron / scheduled task (Render cron, Vercel cron, k8s
CronJob, systemd timer) — the module ships the function + admin trigger,
NOT the scheduler.

## Endpoints (`/api/admin/backup`, admin only)

| Method | Path | Behaviour |
| --- | --- | --- |
| GET | `/backup?status=&limit=` | Job list with optional filters. |
| POST | `/backup/trigger` `{ kind }` | Create + run a job inline. Returns final job row. |
| POST | `/backup/purge?retentionDays=N` | Delete succeeded jobs older than N days. |

## Events emitted

- `backup.queued`    `{ id, kind }`
- `backup.succeeded` `{ id, sizeBytes, s3Key }`
- `backup.failed`    `{ id, reason }`

## Env

- `BACKUP_S3_BUCKET` — required. Bucket for dump uploads.
- `BACKUP_S3_REGION` — defaults to `us-east-1`.
- `BACKUP_S3_ENDPOINT` — override for S3-compatible (Cloudflare R2, MinIO).
- `BACKUP_DB_URL` — connection string for `pg_dump`/`mysqldump`. Defaults to `DATABASE_URL`.

## Replacing the stub

The shipped `_do_dump()` + `_do_upload()` are deterministic stubs so smoke
tests pass without `boto3` + a live bucket. Production:

```python
import asyncio, boto3, os

async def _do_dump(db_url: str) -> bytes:
    proc = await asyncio.create_subprocess_exec(
        "pg_dump", db_url, "--no-owner",
        stdout=asyncio.subprocess.PIPE,
    )
    stdout, _ = await proc.communicate()
    if proc.returncode != 0:
        raise RuntimeError(f"pg_dump exit {proc.returncode}")
    return stdout

async def _do_upload(*, bucket: str, key: str, data: bytes) -> int:
    boto3.client(
        "s3",
        region_name=os.getenv("BACKUP_S3_REGION", "us-east-1"),
        endpoint_url=os.getenv("BACKUP_S3_ENDPOINT"),
    ).put_object(Bucket=bucket, Key=key, Body=data)
    return len(data)
```

## Pairs with

- `audit-log` (optional) — subscribe to `backup.succeeded` for compliance trails.
- `notifications` (optional) — alert ops on `backup.failed`.
