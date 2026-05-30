"""FastAPI routes implementing search-meili@v1."""
from typing import Annotated

from fastapi import APIRouter, Depends, Query, status

from app.auth_core.dependencies import CurrentAdmin
from app.events_bus.bus import bus
from app.search_meili.client import delete, search, stats, upsert
from app.search_meili.schemas import (
    DeleteBody,
    SearchHit,
    SearchResponse,
    StatsResponse,
    UpsertBody,
)


public_router = APIRouter()
admin_router = APIRouter()


# ---- PUBLIC ----


@public_router.get("/search/{index}", response_model=SearchResponse)
async def search_endpoint(
    index: str,
    q: Annotated[str, Query(min_length=0, max_length=1024)] = "",
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    offset: Annotated[int, Query(ge=0, le=10_000)] = 0,
) -> SearchResponse:
    result = await search(index, q, limit=limit, offset=offset)
    return SearchResponse(
        hits=[SearchHit(**hit) for hit in result["hits"]],
        total=result["total"],
        processingTimeMs=result["processingTimeMs"],
        query=result["query"],
        offset=result["offset"],
        limit=result["limit"],
    )


# ---- ADMIN ----


@admin_router.post(
    "/search/index", status_code=status.HTTP_201_CREATED
)
async def upsert_endpoint(
    body: UpsertBody,
    _: CurrentAdmin,
) -> dict:
    await upsert(body.index, body.document_id, body.document)
    await bus.emit(
        "search.indexed",
        {"index": body.index, "documentId": body.document_id},
    )
    return {"index": body.index, "documentId": body.document_id, "indexed": True}


@admin_router.delete(
    "/search/index", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_endpoint(
    body: DeleteBody,
    _: CurrentAdmin,
) -> None:
    await delete(body.index, body.document_id)
    await bus.emit(
        "search.removed",
        {"index": body.index, "documentId": body.document_id},
    )


@admin_router.get("/search/stats", response_model=StatsResponse)
async def stats_endpoint(_: CurrentAdmin) -> StatsResponse:
    raw = await stats()
    return StatsResponse(**raw)
