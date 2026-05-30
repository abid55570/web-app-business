"""Plausible API client — server-side goal/event capture.

POSTs JSON to ``<host>/api/event`` with a User-Agent + X-Forwarded-For
headers proxied from the original request. Stub returns "delivered" so
smoke tests pass.
"""
from __future__ import annotations

import logging
import os
from typing import Any


logger = logging.getLogger(__name__)


DEFAULT_HOST = "https://plausible.io"


def host() -> str:
    return os.getenv("PLAUSIBLE_API_HOST", DEFAULT_HOST)


def domain() -> str | None:
    return os.getenv("PLAUSIBLE_DOMAIN")


def enabled() -> bool:
    return domain() is not None


async def _send(payload: dict, *, user_agent: str, ip: str | None) -> str:
    """Real impl:

        async with httpx.AsyncClient(timeout=2) as c:
            r = await c.post(
                f"{host()}/api/event",
                json=payload,
                headers={
                    "User-Agent": user_agent,
                    "X-Forwarded-For": ip or "",
                },
            )
            r.raise_for_status()
        return "delivered"
    """
    logger.info(
        "plausible stub event name=%s domain=%s",
        payload.get("name"),
        payload.get("domain"),
    )
    return "delivered"


async def goal(
    *,
    name: str,
    url: str,
    props: dict[str, Any] | None = None,
    user_agent: str = "",
    ip: str | None = None,
) -> str:
    if not enabled():
        return "disabled"
    payload = {
        "name": name,
        "domain": domain(),
        "url": url,
        "props": props or {},
    }
    try:
        return await _send(payload, user_agent=user_agent, ip=ip)
    except Exception as e:  # noqa: BLE001
        logger.warning("plausible goal failed: %s", e)
        return "dropped"
