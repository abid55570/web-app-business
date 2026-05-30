"""Pydantic schemas for backup@v1."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


JobKind = Literal["scheduled", "manual", "restore"]
JobStatus = Literal["queued", "running", "succeeded", "failed"]


class TriggerBody(BaseModel):
    kind: JobKind = "manual"


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    kind: JobKind
    status: JobStatus
    s3_key: str | None = Field(default=None, alias="s3Key")
    size_bytes: int = Field(alias="sizeBytes")
    started_at: datetime | None = Field(default=None, alias="startedAt")
    finished_at: datetime | None = Field(default=None, alias="finishedAt")
    reason: str | None
    created_at: datetime = Field(alias="createdAt")


class JobListResponse(BaseModel):
    items: list[JobResponse]
    total: int
