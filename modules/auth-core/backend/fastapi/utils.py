"""Session token (JWT) + password hashing primitives.

JWT was chosen for the spike because it's stateless and survives any
session-strategy split (password, OAuth, magic-link, ...). Future variants
(``auth-revocable``) can wrap these to add server-side blacklisting.
"""
from datetime import datetime, timedelta, timezone

import bcrypt
from jose import JWTError, jwt

from app.config import settings


# --- passwords ------------------------------------------------------------


def hash_password(plaintext: str) -> str:
    salt = bcrypt.gensalt(rounds=settings.bcrypt_rounds)
    return bcrypt.hashpw(plaintext.encode("utf-8"), salt).decode("utf-8")


def verify_password(plaintext: str, hashed: str) -> bool:
    return bcrypt.checkpw(plaintext.encode("utf-8"), hashed.encode("utf-8"))


# --- session tokens -------------------------------------------------------


def create_session_token(user_id: str) -> tuple[str, datetime]:
    """Mint a signed JWT for ``user_id``. Returns (token, expires_at)."""
    expires_at = datetime.now(timezone.utc) + timedelta(
        minutes=settings.jwt_expiration_minutes
    )
    payload = {"sub": user_id, "exp": expires_at}
    token = jwt.encode(
        payload,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm,
    )
    return token, expires_at


def decode_session_token(token: str) -> str | None:
    """Return the ``sub`` claim if the token is valid, else ``None``."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        return None
    sub = payload.get("sub")
    return sub if isinstance(sub, str) else None
