"""FastAPI routes implementing ai-llm@v1."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentAdmin, CurrentUser
from app.database import get_db
from app.ai_llm.schemas import (
    ChatBody,
    ChatResponse,
    UsageListResponse,
    UsageRow,
)
from app.ai_llm.service import chat, daily_request_count, list_usage


public_router = APIRouter()
admin_router = APIRouter()


@public_router.post(
    "/ai/chat", response_model=ChatResponse, response_model_by_alias=True
)
async def chat_endpoint(
    body: ChatBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> ChatResponse:
    log, message = await chat(db, user_id=user.id, body=body)
    return ChatResponse(
        id=log.id,
        provider=log.provider,
        model=log.model,
        message=message,
        input_tokens=log.input_tokens,
        output_tokens=log.output_tokens,
        latency_ms=log.latency_ms,
    )


@public_router.get("/ai/usage/my")
async def my_usage(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> dict:
    used = await daily_request_count(db, user.id)
    return {"userId": user.id, "usedLast24h": used}


@admin_router.get(
    "/ai/usage",
    response_model=UsageListResponse,
    response_model_by_alias=True,
)
async def list_usage_admin(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: CurrentAdmin,
    user_id: Annotated[str | None, Query(alias="userId")] = None,
    limit: Annotated[int, Query(ge=1, le=1000)] = 200,
) -> UsageListResponse:
    items = await list_usage(db, user_id=user_id, limit=limit)
    return UsageListResponse(
        items=[UsageRow.model_validate(l) for l in items],
        total=len(items),
    )
