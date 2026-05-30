"""Pydantic schemas for audit-log@v1."""
import json
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


class AuditRecordBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    action: str = Field(min_length=1, max_length=128)
    target_type: str | None = Field(default=None, alias="targetType", max_length=64)
    target_id: str | None = Field(default=None, alias="targetId", max_length=255)
    metadata: dict | None = None


class AuditResponse(BaseModel):
    model_config = ConfigDict(from_attributes=False, populate_by_name=True)

    id: str
    actor_id: str = Field(alias="actorId")
    action: str
    target_type: str | None = Field(default=None, alias="targetType")
    target_id: str | None = Field(default=None, alias="targetId")
    metadata: dict
    ip: str | None
    user_agent: str | None = Field(default=None, alias="userAgent")
    created_at: datetime = Field(alias="createdAt")

    @field_validator("metadata", mode="before")
    @classmethod
    def _decode_metadata(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v) if v else {}
            except json.JSONDecodeError:
                return {}
        return v or {}

    @classmethod
    def from_model(cls, entry) -> "AuditResponse":
        return cls(
            id=entry.id,
            actor_id=entry.actor_id,
            action=entry.action,
            target_type=entry.target_type,
            target_id=entry.target_id,
            metadata=entry.metadata_json,
            ip=entry.ip_address,
            user_agent=entry.user_agent,
            created_at=entry.created_at,
        )


class AuditListResponse(BaseModel):
    items: list[AuditResponse]
    total: int
