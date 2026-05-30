"""Auth utilities — bcrypt password hashing + JWT generation.

Wirer placement: <output>/backend/app/auth/utils.py
"""
from datetime import datetime, timedelta, timezone
from typing import Any

import bcrypt
from jose import JWTError, jwt

from app.config import settings


def hash_password(password: str) -> str:
    """Hash a plaintext password with bcrypt using settings.bcrypt_rounds."""
    salt = bcrypt.gensalt(rounds=settings.bcrypt_rounds)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    """Verify a plaintext password against a bcrypt hash. Returns False on any failure."""
    try:
        return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def create_session_token(user_id: str) -> tuple[str, datetime]:
    """Create a signed JWT session token. Returns ``(token, expires_at)``."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expiration_minutes
    )
    payload: dict[str, Any] = {
        "sub": user_id,
        "exp": int(expires_at.timestamp()),
        "iat": int(datetime.now(timezone.utc).timestamp()),
        "type": "session",
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=settings.jwt_algorithm)
    return token, expires_at


def decode_session_token(token: str) -> str | None:
    """Decode + verify a JWT session token. Returns user_id or None on any failure."""
    if not token:
        return None
    try:
        payload = jwt.decode(
            token, settings.jwt_secret, algorithms=[settings.jwt_algorithm]
        )
    except JWTError:
        return None

    if payload.get("type") != "session":
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None
