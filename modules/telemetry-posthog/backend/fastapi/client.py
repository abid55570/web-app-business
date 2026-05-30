"""PostHog HTTP capture client — fire-and-forget by design.

Real impl POSTs to ``${POSTHOG_HOST}/capture/`` with the project API key.
Stub here logs to console + returns deterministic outcomes so smoke tests
don't need network.
"""
from __future__ import annotations

import logging
import os
from typing import Any


logger = logging.getLogger(__name__)


DEFAULT_HOST = "https://us.posthog.com"


def _config() -> tuple[str | None, str]:
    return os.getenv("POSTHOG_API_KEY") or None, os.getenv(
        "POSTHOG_HOST", DEFAULT_HOST
    )


async def _send(payload: dict) -> str:
    """Real impl:

        async with httpx.AsyncClient(timeout=2) as c:
            r = await c.post(f"{host}/capture/", json=payload)
            r.raise_for_status()
        return "delivered"
    """
    logger.info(
        "posthog stub capture event=%s distinct_id=%s",
        payload.get("event"),
        payload.get("distinct_id"),
    )
    return "delivered"


async def track(
    *,
    event: str,
    distinct_id: str,
    properties: dict[str, Any] | None = None,
) -> str:
    """Returns "delivered" | "dropped" | "disabled". Never raises."""
    api_key, host = _config()
    if not api_key:
        return "disabled"
    payload = {
        "api_key": api_key,
        "event": event,
        "distinct_id": distinct_id,
        "properties": properties or {},
    }
    try:
        return await _send(payload)
    except Exception as e:  # noqa: BLE001
        logger.warning("posthog capture failed: %s", e)
        return "dropped"


def enabled() -> bool:
    return _config()[0] is not None


def host() -> str:
    return _config()[1]
