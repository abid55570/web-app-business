"""FastAPI dependencies for auth.

Wirer placement: <output>/backend/app/auth/dependencies.py

Provides ``get_current_user`` (any authenticated user) and
``get_current_admin`` (role in {"admin", "owner"}). Other modules import
both via ``from app.auth.dependencies import ...`` — the snake_case package
name is fixed by the wirer, so module ids with hyphens (e.g. ``auth-jwt``)
still resolve to ``app.auth_jwt.dependencies``.
"""
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth.model import User
from app.auth.utils import decode_session_token
from app.database import get_db


ADMIN_ROLES = {"admin", "owner"}


async def get_current_user(
    authorization: Annotated[str | None, Header()] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,  # type: ignore[assignment]
) -> User:
    """Resolve the current user from the ``Authorization: Bearer <jwt>`` header.

    Raises 401 AUTH_MISSING_TOKEN if no Bearer header.
    Raises 401 AUTH_INVALID_TOKEN if the token is malformed or expired.
    Raises 401 AUTH_USER_NOT_FOUND if the token decodes but the user no longer
    exists or has been deactivated (treated the same as a missing user to
    avoid leaking account-existence signal).
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
    """Require an authenticated user with role ∈ {admin, owner}.

    Raises 403 AUTH_FORBIDDEN if the user is authenticated but lacks the role.
    """
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
