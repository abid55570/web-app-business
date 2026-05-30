"""FastAPI routes for telemetry-plausible."""
from typing import Annotated

from fastapi import APIRouter, Header, Request
from pydantic import BaseModel, Field

from app.auth_core.dependencies import CurrentUser
from app.events_bus.bus import bus
from app.telemetry_plausible.client import domain, enabled, goal, host


router = APIRouter()


class GoalBody(BaseModel):
    name: str = Field(min_length=1, max_length=128)
    url: str = Field(min_length=1, max_length=2048)
    props: dict | None = None


class GoalResponse(BaseModel):
    name: str
    outcome: str


class HealthResponse(BaseModel):
    enabled: bool
    host: str
    domain: str | None


@router.get("/telemetry/plausible/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(enabled=enabled(), host=host(), domain=domain())


@router.post(
    "/telemetry/plausible/goal", response_model=GoalResponse
)
async def goal_endpoint(
    body: GoalBody,
    request: Request,
    _: CurrentUser,
    user_agent: Annotated[str | None, Header(alias="User-Agent")] = None,
) -> GoalResponse:
    ip = request.client.host if request.client else None
    outcome = await goal(
        name=body.name,
        url=body.url,
        props=body.props,
        user_agent=user_agent or "",
        ip=ip,
    )
    if outcome == "delivered" and domain():
        await bus.emit(
            "telemetry.plausible.goal",
            {"goal": body.name, "domain": domain() or ""},
        )
    return GoalResponse(name=body.name, outcome=outcome)
