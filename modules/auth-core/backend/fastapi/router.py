"""auth-core router — strategy-agnostic authenticated endpoints.

  GET  /api/auth/me                — return the current user
  POST /api/auth/logout            — stateless logout (token expires naturally)
  POST /api/auth/change-password   — set/replace the password on the account

Strategy-specific entry routes (login, signup, OAuth callbacks) belong to
the variant modules (auth-jwt, auth-oauth, ...).
"""
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.auth_core.schemas import (
    ChangePasswordRequest,
    UserResponse,
)
from app.auth_core.utils import hash_password, verify_password
from app.database import get_db
from app.events_bus.bus import emit


router = APIRouter()


@router.get(
    "/me",
    response_model=UserResponse,
    response_model_by_alias=True,
)
async def me_endpoint(user: CurrentUser) -> UserResponse:
    return UserResponse.model_validate(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout_endpoint(_: CurrentUser) -> None:
    """Stateless — the client just discards the token. Future
    ``auth-revocable`` variant adds server-side blacklisting."""
    return None


@router.post(
    "/change-password",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def change_password_endpoint(
    body: ChangePasswordRequest,
    user: CurrentUser,
    db: Annotated[AsyncSession, Depends(get_db)],
) -> None:
    """Set / replace the password.

    If the account already has a password (``current_password`` required),
    verify it before rotating. OAuth-only accounts can set an initial password
    without supplying a current one.
    """
    if user.password_hash is not None:
        if not body.current_password or not verify_password(
            body.current_password, user.password_hash
        ):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail={
                    "code": "AUTH_CURRENT_PASSWORD_INVALID",
                    "message": "Current password is required and must match.",
                },
            )

    user.password_hash = hash_password(body.new_password)
    await db.flush()
    await emit("user.password-changed", {"userId": user.id}, db)
    return None
