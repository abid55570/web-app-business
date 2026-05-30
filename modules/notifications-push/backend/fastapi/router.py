"""FastAPI routes implementing notifications-push@v1."""
from typing import Annotated

from fastapi import APIRouter, Depends, Header, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.notifications_push.schemas import (
    SendBody,
    SendResponse,
    SubscribeBody,
    SubscriptionListResponse,
    SubscriptionResponse,
    VapidPublicKey,
)
from app.notifications_push.service import (
    dispatch,
    list_for_user,
    subscribe,
    unsubscribe,
    vapid_public_key,
)


router = APIRouter()


@router.get(
    "/notifications/push/vapid-public-key",
    response_model=VapidPublicKey,
    response_model_by_alias=True,
)
async def vapid_key() -> VapidPublicKey:
    return VapidPublicKey(public_key=vapid_public_key())


@router.post(
    "/notifications/push/subscriptions",
    response_model=SubscriptionResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def subscribe_endpoint(
    body: SubscribeBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    user_agent: Annotated[str | None, Header(alias="User-Agent")] = None,
) -> SubscriptionResponse:
    sub = await subscribe(db, user_id=user.id, body=body, user_agent=user_agent)
    return SubscriptionResponse.model_validate(sub)


@router.delete(
    "/notifications/push/subscriptions", status_code=status.HTTP_204_NO_CONTENT
)
async def unsubscribe_endpoint(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
    endpoint: Annotated[str, Query()],
) -> None:
    await unsubscribe(db, user_id=user.id, endpoint=endpoint)


@router.get(
    "/notifications/push/subscriptions/my",
    response_model=SubscriptionListResponse,
    response_model_by_alias=True,
)
async def my_subs(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> SubscriptionListResponse:
    items = await list_for_user(db, user.id)
    return SubscriptionListResponse(
        items=[SubscriptionResponse.model_validate(s) for s in items],
        total=len(items),
    )


@router.post(
    "/notifications/push/send",
    response_model=SendResponse,
    response_model_by_alias=True,
)
async def send_endpoint(
    body: SendBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
) -> SendResponse:
    delivered, expired = await dispatch(
        db, user_id=body.user_id, payload=body.payload
    )
    return SendResponse(
        user_id=body.user_id,
        delivered_count=delivered,
        expired_count=expired,
    )
