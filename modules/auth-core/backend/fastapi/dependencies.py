"""FastAPI dependencies for auth — current user + admin gates.

All session strategies (auth-jwt, auth-oauth, ...) MUST mint tokens via
``auth_core.utils.create_session_token`` so this single decode path resolves
the user regardless of how the token was issued.
"""
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.model import User
from app.auth_core.utils import decode_session_token
from app.database import get_db


ADMIN_ROLES = {"admin", "owner"}


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,  # type: ignore[assignment]
) -> User:
    """Resolve the current user from ``Authorization: Bearer <jwt>``.

    Returns 401 with one of: AUTH_MISSING_TOKEN, AUTH_INVALID_TOKEN,
    AUTH_USER_NOT_FOUND. The not-found code is reused for "deactivated"
    so we don't leak account-existence signal.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_MISSING_TOKEN",
                "message": "Missing or malformed Authorization header.",
            },
        )

    token = authorization.removeprefix("Bearer ").strip()
    user_id = decode_session_token(token)
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_INVALID_TOKEN",
                "message": "Invalid or expired session token.",
            },
        )

    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if user is None or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "code": "AUTH_USER_NOT_FOUND",
                "message": "User no longer exists or is inactive.",
            },
        )
    return user


async def get_current_admin(
    user: Annotated[User, Depends(get_current_user)],
) -> User:
    """Require ``role`` ∈ {admin, owner}. 403 AUTH_FORBIDDEN otherwise."""
    if user.role not in ADMIN_ROLES:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "AUTH_FORBIDDEN",
                "message": "Admin role required for this operation.",
            },
        )
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
CurrentAdmin = Annotated[User, Depends(get_current_admin)]
