"""auth-oauth — exchange OAuth code → upsert User → mint session token."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.model import User
from app.auth_core.schemas import AuthResponse, SessionResponse, UserResponse
from app.auth_core.utils import create_session_token
from app.auth_oauth.providers import ProviderProfile, get_provider
from app.errors import AppError


class OAuthError(AppError):
    pass


async def handle_callback(
    db: AsyncSession, provider_name: str, code: str
) -> AuthResponse:
    provider = get_provider(provider_name)
    if provider is None:
        raise OAuthError(
            "AUTH_OAUTH_PROVIDER_UNKNOWN",
            f"Unknown OAuth provider: {provider_name}",
            status_code=400,
        )

    try:
        profile = await provider.exchange_code(code)
    except ValueError as exc:
        raise OAuthError(
            "AUTH_OAUTH_CODE_INVALID",
            str(exc) or "OAuth callback code missing.",
            status_code=400,
        )

    user = await _upsert_oauth_user(db, profile)

    token, expires_at = create_session_token(user.id)
    return AuthResponse(
        user=UserResponse.model_validate(user),
        session=SessionResponse(token=token, user_id=user.id, expires_at=expires_at),
    )


async def _upsert_oauth_user(db: AsyncSession, profile: ProviderProfile) -> User:
    """Resolution order:
       1. Existing user with same (provider, subject) → reuse.
       2. Existing user with same email → link OAuth identity to it.
       3. Otherwise create a new user with no password (OAuth-only)."""
    by_link = await db.execute(
        select(User).where(
            User.oauth_provider == profile.provider,
            User.oauth_subject == profile.subject,
        )
    )
    user = by_link.scalar_one_or_none()
    if user is not None:
        return user

    by_email = await db.execute(
        select(User).where(User.email == profile.email.lower())
    )
    user = by_email.scalar_one_or_none()
    if user is not None:
        user.oauth_provider = profile.provider
        user.oauth_subject = profile.subject
        if not user.email_verified:
            user.email_verified = True
        await db.flush()
        return user

    user = User(
        email=profile.email.lower(),
        name=profile.name,
        oauth_provider=profile.provider,
        oauth_subject=profile.subject,
        email_verified=True,
        password_hash=None,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user
