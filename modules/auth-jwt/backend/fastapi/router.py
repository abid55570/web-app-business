"""auth-jwt router — /api/auth/signup, /api/auth/login.

Mounted alongside the auth-core router at the same /api/auth prefix; the
two contribute different endpoint suffixes so they don't collide.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.schemas import AuthResponse
from app.auth_jwt.schemas import LoginRequest, SignupRequest
from app.auth_jwt.service import login, signup
from app.config import settings
from app.database import get_db
from app.events_bus.bus import emit


router = APIRouter()


@router.post(
    "/signup",
    response_model=AuthResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def signup_endpoint(
    body: SignupRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    # `allow_signup` knob lives on settings via a future config injection;
    # for now keep open. Future: wirer surfaces module config_knobs here.
    _ = settings
    res = await signup(db, body.email, body.password, body.name)
    await emit(
        "user.signed-up",
        {"userId": res.user.id, "email": res.user.email},
        db,
    )
    return res


@router.post(
    "/login",
    response_model=AuthResponse,
    response_model_by_alias=True,
)
async def login_endpoint(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    res = await login(db, body.email, body.password)
    await emit("user.signed-in", {"userId": res.user.id}, db)
    return res
