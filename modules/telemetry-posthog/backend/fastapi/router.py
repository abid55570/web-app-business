"""FastAPI routes for telemetry-posthog."""
from typing import Annotated

from fastapi import APIRouter
from pydantic import BaseModel, ConfigDict, Field

from app.auth_core.dependencies import CurrentUser
from app.events_bus.bus import bus
from app.telemetry_posthog.client import enabled, host, track


router = APIRouter()


class TrackBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    event: str = Field(min_length=1, max_length=128)
    distinct_id: str | None = Field(
        default=None, alias="distinctId", max_length=128
    )
    properties: dict | None = None


class TrackResponse(BaseModel):
    event: str
    outcome: str


class HealthResponse(BaseModel):
    enabled: bool
    host: str


@router.get("/telemetry/posthog/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(enabled=enabled(), host=host())


@router.post(
    "/telemetry/posthog/track",
    response_model=TrackResponse,
)
async def track_endpoint(
    body: TrackBody, user: CurrentUser
) -> TrackResponse:
    """Per-event server-side capture. distinct_id defaults to current user."""
    distinct = body.distinct_id or user.id
    outcome = await track(
        event=body.event,
        distinct_id=distinct,
        properties=body.properties,
    )
    if outcome == "delivered":
        await bus.emit(
            "telemetry.posthog.tracked",
            {"event": body.event, "distinctId": distinct},
        )
    elif outcome == "dropped":
        await bus.emit(
            "telemetry.posthog.failed",
            {"event": body.event, "reason": "network"},
        )
    return TrackResponse(event=body.event, outcome=outcome)
