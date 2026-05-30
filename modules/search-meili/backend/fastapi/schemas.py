"""Pydantic schemas for search-meili@v1."""
from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class SearchHit(BaseModel):
    model_config = ConfigDict(extra="allow")  # arbitrary document shape

    id: str


class SearchResponse(BaseModel):
    hits: list[SearchHit]
    total: int
    processingTimeMs: int
    query: str
    offset: int
    limit: int


class UpsertBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    index: str = Field(min_length=1, max_length=64, pattern=r"^[a-z][a-z0-9_-]*$")
    document_id: str = Field(alias="documentId", min_length=1, max_length=255)
    document: dict[str, Any]


class DeleteBody(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    index: str = Field(min_length=1, max_length=64, pattern=r"^[a-z][a-z0-9_-]*$")
    document_id: str = Field(alias="documentId", min_length=1, max_length=255)


class StatsResponse(BaseModel):
    host: str
    indexes: dict[str, dict]
