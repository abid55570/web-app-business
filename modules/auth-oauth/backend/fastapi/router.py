"""auth-oauth router — /api/auth/oauth/<provider>/callback.

The /authorize redirect kicks off the OAuth flow on the client; the callback
endpoint accepts the provider's code, exchanges it, and returns a session
token in the same AuthResponse shape as auth-jwt.
"""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.schemas import AuthResponse
from app.auth_oauth.service import handle_callback
from app.database import get_db
from app.events_bus.bus import emit


router = APIRouter()


@router.get(
    "/oauth/{provider}/callback",
    response_model=AuthResponse,
    response_model_by_alias=True,
)
async def oauth_callback(
    provider: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    code: Annotated[str, Query()],
) -> AuthResponse:
    res = await handle_callback(db, provider, code)
    await emit(
        "user.oauth-linked",
        {"userId": res.user.id, "provider": provider},
        db,
    )
    await emit("user.signed-in", {"userId": res.user.id}, db)
    return res
