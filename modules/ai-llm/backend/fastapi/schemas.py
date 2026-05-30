"""Pydantic schemas for ai-llm@v1."""
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


Provider = Literal["anthropic", "openai"]


class Message(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=120_000)


class ChatBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    provider: Provider | None = None
    model: str | None = None
    messages: list[Message] = Field(min_length=1, max_length=128)
    max_tokens: int = Field(default=1024, alias="maxTokens", ge=1, le=8192)
    temperature: float = Field(default=0.7, ge=0.0, le=2.0)


class ChatResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str
    provider: Provider
    model: str
    message: Message
    input_tokens: int = Field(alias="inputTokens")
    output_tokens: int = Field(alias="outputTokens")
    latency_ms: int = Field(alias="latencyMs")


class UsageRow(BaseModel):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    user_id: str = Field(alias="userId")
    provider: Provider
    model: str
    input_tokens: int = Field(alias="inputTokens")
    output_tokens: int = Field(alias="outputTokens")
    cost_cents: int = Field(alias="costCents")
    latency_ms: int = Field(alias="latencyMs")
    created_at: datetime = Field(alias="createdAt")


class UsageListResponse(BaseModel):
    items: list[UsageRow]
    total: int
