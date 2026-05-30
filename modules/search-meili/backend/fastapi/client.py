"""Meilisearch client wrapper — single integration seam.

Real impl uses `meilisearch-python-async`; this stub returns deterministic
results so tests don't need a running server. Production swap = three
function bodies + add the dep to backend pyproject.
"""
from __future__ import annotations

import os
from dataclasses import dataclass, field
from typing import Any


@dataclass
class _LocalStore:
    """Local in-memory fallback so the module ships testable without
    Meilisearch installed. NOT for production — every restart drops data."""

    docs: dict[str, dict[str, dict]] = field(default_factory=dict)

    def _idx(self, index: str) -> dict[str, dict]:
        return self.docs.setdefault(index, {})


_local = _LocalStore()


def host() -> str:
    return os.getenv("MEILI_HOST", "http://localhost:7700")


def master_key() -> str | None:
    return os.getenv("MEILI_MASTER_KEY")


async def upsert(index: str, doc_id: str, document: dict) -> None:
    """In prod: `await client.index(index).add_documents([document], primary_key='id')`."""
    document = {**document, "id": doc_id}
    _local._idx(index)[doc_id] = document


async def delete(index: str, doc_id: str) -> None:
    _local._idx(index).pop(doc_id, None)


async def search(
    index: str,
    query: str,
    *,
    limit: int = 20,
    offset: int = 0,
    filters: dict[str, Any] | None = None,
) -> dict:
    """Returns { hits, total, processingTimeMs }. Local impl scans the
    in-memory store with a case-insensitive substring match across all
    string values."""
    docs = list(_local._idx(index).values())
    q = (query or "").lower().strip()

    def _matches(doc: dict) -> bool:
        if filters:
            for k, v in filters.items():
                if doc.get(k) != v:
                    return False
        if not q:
            return True
        for value in doc.values():
            if isinstance(value, str) and q in value.lower():
                return True
        return False

    matched = [d for d in docs if _matches(d)]
    sliced = matched[offset : offset + limit]
    return {
        "hits": sliced,
        "total": len(matched),
        "processingTimeMs": 0,
        "query": query,
        "offset": offset,
        "limit": limit,
    }


async def stats() -> dict:
    return {
        "host": host(),
        "indexes": {
            name: {"documents": len(docs)}
            for name, docs in _local.docs.items()
        },
    }
