"""Sentry SDK wrapper — single integration seam other modules call into.

Real impl uses `sentry_sdk` from the official Sentry Python SDK; the stub
here is a no-op so the module compiles + tests pass without `sentry_sdk`
installed. In production replace `_init_sdk()` + `_capture_exception()`
with the real SDK calls.
"""
from __future__ import annotations

import logging
import os
from typing import Any


logger = logging.getLogger(__name__)


_initialized = False


def _init_sdk(*, dsn: str, environment: str, release: str | None) -> None:
    """Real impl:

        import sentry_sdk
        sentry_sdk.init(dsn=dsn, environment=environment, release=release, ...)
    """
    logger.info(
        "sentry stub init dsn=%s env=%s release=%s",
        _redact(dsn),
        environment,
        release,
    )


def _capture_exception(exc: BaseException, **scope: Any) -> str:
    """Real impl: `sentry_sdk.capture_exception(exc)`. Returns the
    Sentry event id."""
    logger.warning("sentry stub capture: %s scope=%s", exc, scope)
    return "stub-event-id"


def init_sentry() -> bool:
    """Initialize at app startup. Idempotent. Returns True when Sentry
    was actually initialized (DSN present)."""
    global _initialized
    if _initialized:
        return True
    dsn = os.getenv("SENTRY_DSN", "").strip()
    if not dsn:
        return False
    env = os.getenv("SENTRY_ENVIRONMENT", os.getenv("RUNTIME_ENV", "development"))
    release = os.getenv("SENTRY_RELEASE")
    _init_sdk(dsn=dsn, environment=env, release=release)
    _initialized = True
    return True


def set_user_context(*, user_id: str, email: str | None = None) -> None:
    """Stash user identity on the active Sentry scope. Other modules
    call this from their auth middleware so errors carry user info."""
    if not _initialized:
        return
    logger.debug("sentry stub set_user_context user_id=%s", user_id)


def capture_exception(exc: BaseException, **scope: Any) -> str | None:
    """Manually report an exception that's already been caught. Useful
    for "expected but interesting" failures (third-party API timeouts,
    payment provider errors, etc)."""
    if not _initialized:
        return None
    return _capture_exception(exc, **scope)


def _redact(dsn: str) -> str:
    """Mask the secret key in the DSN for log lines."""
    if "@" not in dsn:
        return "***"
    scheme_key, host_project = dsn.split("@", 1)
    scheme, _ = scheme_key.split("://", 1) if "://" in scheme_key else ("", "")
    return f"{scheme}://***@{host_project}"
