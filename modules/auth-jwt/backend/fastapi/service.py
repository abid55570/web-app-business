"""auth-jwt — signup + login business logic.

Both flows mint a session token via auth-core utils so /me /logout
/change-password (auth-core router) work transparently afterwards.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.model import User
from app.auth_core.schemas import AuthResponse, SessionResponse, UserResponse
from app.auth_core.utils import (
    create_session_token,
    hash_password,
    verify_password,
)
from app.errors import AppError


class AuthError(AppError):
    """Mapped to JSON by error_handler middleware."""


async def signup(
    db: AsyncSession, email: str, password: str, name: str | None
) -> AuthResponse:
    normalized_email = email.lower()
    existing = await db.execute(select(User).where(User.email == normalized_email))
    if existing.scalar_one_or_none() is not None:
        raise AuthError(
            "AUTH_EMAIL_TAKEN",
            "An account with this email already exists.",
            status_code=409,
        )

    user = User(
        email=normalized_email,
        password_hash=hash_password(password),
        name=name,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    token, expires_at = create_session_token(user.id)
    return AuthResponse(
        user=UserResponse.model_validate(user),
        session=SessionResponse(token=token, user_id=user.id, expires_at=expires_at),
    )


async def login(db: AsyncSession, email: str, password: str) -> AuthResponse:
    """Same error code (AUTH_INVALID) for "wrong password" and "no such user"
    so we don't leak account-existence signal."""
    normalized_email = email.lower()
    result = await db.execute(select(User).where(User.email == normalized_email))
    user = result.scalar_one_or_none()

    # OAuth-only users have no password_hash; treat as invalid login attempt.
    if (
        user is None
        or user.password_hash is None
        or not verify_password(password, user.password_hash)
    ):
        raise AuthError("AUTH_INVALID", "Invalid email or password.", status_code=401)

    if not user.is_active:
        raise AuthError("AUTH_USER_INACTIVE", "Account is inactive.", status_code=403)

    token, expires_at = create_session_token(user.id)
    return AuthResponse(
        user=UserResponse.model_validate(user),
        session=SessionResponse(token=token, user_id=user.id, expires_at=expires_at),
    )
