"""FastAPI routes for telemetry-sentry — health probe + manual capture."""
from typing import Annotated

from fastapi import APIRouter, status
from pydantic import BaseModel

from app.auth_core.dependencies import CurrentAdmin
from app.events_bus.bus import bus
from app.telemetry_sentry.client import (
    capture_exception,
    init_sentry,
)


router = APIRouter()


class HealthResponse(BaseModel):
    initialized: bool


class CaptureBody(BaseModel):
    message: str
    level: str = "error"
    fingerprint: str | None = None


class CaptureResponse(BaseModel):
    eventId: str | None
    captured: bool


@router.get("/telemetry/sentry/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(initialized=init_sentry())


@router.post(
    "/telemetry/sentry/capture",
    response_model=CaptureResponse,
    status_code=status.HTTP_200_OK,
)
async def manual_capture(body: CaptureBody, _: CurrentAdmin) -> CaptureResponse:
    """Admin-only — synthetic event for verifying the integration."""
    event_id = capture_exception(
        Exception(body.message),
        fingerprint=body.fingerprint,
        level=body.level,
    )
    await bus.emit(
        "telemetry.sentry.error",
        {"fingerprint": body.fingerprint or "manual", "level": body.level},
    )
    return CaptureResponse(eventId=event_id, captured=event_id is not None)
