"""ai-llm business logic — provider relay + per-(user, day) rate limit.

`call_provider()` is a single hook other code can monkey-patch in tests.
Real impl branches on `provider` and calls anthropic / openai SDK.
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.ai_llm.model import AILog
from app.ai_llm.schemas import ChatBody, Message


class AIError(AppError):
    """Raised by the ai-llm service."""


DEFAULT_PROVIDER = "anthropic"
DEFAULT_MODEL = "claude-3-5-sonnet-latest"
DEFAULT_DAILY_CAP = 200


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


async def daily_request_count(db: AsyncSession, user_id: str) -> int:
    since = _utcnow() - timedelta(hours=24)
    stmt = (
        select(func.count())
        .select_from(AILog)
        .where(AILog.user_id == user_id, AILog.created_at >= since)
    )
    return int((await db.execute(stmt)).scalar_one())


async def assert_within_cap(db: AsyncSession, user_id: str) -> None:
    cap = int(os.getenv("AI_DAILY_REQUEST_CAP", str(DEFAULT_DAILY_CAP)))
    if cap <= 0:
        return
    used = await daily_request_count(db, user_id)
    if used >= cap:
        await bus.emit(
            "ai.rate-limited",
            {"userId": user_id, "used": used, "cap": cap},
        )
        raise AIError(
            "AI_RATE_LIMITED",
            f"Daily request cap reached ({used}/{cap}).",
            status_code=429,
        )


async def call_provider(
    *, provider: str, model: str, messages: list[Message], **opts
) -> tuple[Message, int, int]:
    """Returns (assistant_message, input_tokens, output_tokens). Default
    impl returns a stub — replace with anthropic.AsyncAnthropic /
    openai.AsyncClient in production. Tests monkey-patch this fn directly."""
    # Echo last user message back so smoke tests can assert round-trip.
    last_user = next(
        (m for m in reversed(messages) if m.role == "user"), messages[-1]
    )
    reply = Message(
        role="assistant",
        content=f"[stub:{provider}/{model}] {last_user.content[:200]}",
    )
    return reply, len(last_user.content) // 4, len(reply.content) // 4


async def chat(
    db: AsyncSession, *, user_id: str, body: ChatBody
) -> tuple[AILog, Message]:
    await assert_within_cap(db, user_id)

    provider = body.provider or os.getenv(
        "AI_DEFAULT_PROVIDER", DEFAULT_PROVIDER
    )
    model = body.model or os.getenv("AI_DEFAULT_MODEL", DEFAULT_MODEL)

    started = time.perf_counter()
    reply, in_toks, out_toks = await call_provider(
        provider=provider,
        model=model,
        messages=body.messages,
        max_tokens=body.max_tokens,
        temperature=body.temperature,
    )
    latency_ms = int((time.perf_counter() - started) * 1000)

    log = AILog(
        user_id=user_id,
        provider=provider,
        model=model,
        input_tokens=in_toks,
        output_tokens=out_toks,
        cost_cents=_estimate_cost_cents(provider, model, in_toks, out_toks),
        latency_ms=latency_ms,
    )
    db.add(log)
    await db.commit()
    await db.refresh(log)

    await bus.emit(
        "ai.completion",
        {
            "id": log.id,
            "userId": user_id,
            "provider": provider,
            "model": model,
            "inputTokens": in_toks,
            "outputTokens": out_toks,
        },
    )
    return log, reply


def _estimate_cost_cents(
    provider: str, model: str, in_toks: int, out_toks: int
) -> int:
    """Coarse cost estimate. Swap in real per-model pricing in production."""
    rate_in = 300 if "opus" in model else 100  # cents per 1M input tokens
    rate_out = 1500 if "opus" in model else 500
    return int((in_toks * rate_in + out_toks * rate_out) / 1_000_000)


async def list_usage(
    db: AsyncSession, *, user_id: str | None = None, limit: int = 200
) -> list[AILog]:
    stmt = select(AILog).order_by(AILog.created_at.desc()).limit(limit)
    if user_id:
        stmt = stmt.where(AILog.user_id == user_id)
    return list((await db.execute(stmt)).scalars())
