"""FastAPI routes for backup@v1 — admin queue / trigger / inspect."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin
from app.database import get_db
from app.backup.schemas import (
    JobListResponse,
    JobResponse,
    TriggerBody,
)
from app.backup.service import list_jobs, purge_old, run_job, trigger


admin_router = APIRouter()


@admin_router.get(
    "/backup", response_model=JobListResponse, response_model_by_alias=True
)
async def list_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    status_filter: Annotated[str | None, Query(alias="status")] = None,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
) -> JobListResponse:
    items = await list_jobs(db, status=status_filter, limit=limit)
    return JobListResponse(
        items=[JobResponse.model_validate(j) for j in items],
        total=len(items),
    )


@admin_router.post(
    "/backup/trigger",
    response_model=JobResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def trigger_endpoint(
    body: TriggerBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> JobResponse:
    job = await trigger(db, kind=body.kind)
    # Run inline so the admin sees the outcome immediately. For very
    # large databases, swap this for a background-task enqueue.
    job = await run_job(db, job.id)
    return JobResponse.model_validate(job)


@admin_router.post(
    "/backup/purge", response_model=dict
)
async def purge_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    retention_days: Annotated[int, Query(ge=1, le=3650, alias="retentionDays")] = 30,
) -> dict:
    count = await purge_old(db, retention_days=retention_days)
    return {"purged": count}
