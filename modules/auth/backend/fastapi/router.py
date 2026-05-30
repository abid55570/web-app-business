"""FastAPI routes implementing auth@v1.

Wirer placement:
  This file -> <output>/backend/app/auth/router.py
  Mounted in main.py with prefix /api/auth.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.dependencies import CurrentUser
from app.auth.schemas import (
    AuthResponse,
    LoginRequest,
    SignupRequest,
    UserResponse,
)
from app.auth.service import login, signup
from app.database import get_db

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
    return await signup(db, body.email, body.password, body.name)


@router.post(
    "/login",
    response_model=AuthResponse,
    response_model_by_alias=True,
)
async def login_endpoint(
    body: LoginRequest,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> AuthResponse:
    return await login(db, body.email, body.password)


@router.get(
    "/me",
    response_model=UserResponse,
    response_model_by_alias=True,
)
async def me_endpoint(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_endpoint(_: CurrentUser) -> None:
    """Stateless logout — token simply expires.

    Phase 1+ will add server-side revocation for a `auth-revocable` variant.
    """
    return None
