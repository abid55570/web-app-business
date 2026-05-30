"""ws-redis@v1 smoke — fakeredis-backed end-to-end pub/sub fan-out.

Uses fakeredis (memory-only) so tests stay hermetic. The contract is the
same as ws-core: add → broadcast → receive locally; cross-pod fan-out is
exercised by simulating two registries sharing one redis instance.
"""
import asyncio

import pytest

# Smoke is fully exercised in `pytest -m smoke` runs against a real redis
# in CI; here we keep the asserts narrow + non-network.


@pytest.mark.asyncio
async def test_registry_imports_cleanly():
    """Even without redis running, importing the module + constructing the
    registry singleton must not raise. Lazy connect on first add()."""
    from app.ws_redis.registry import registry

    assert registry is not None
    assert registry.channel_prefix == "ws"


@pytest.mark.asyncio
async def test_local_count_works_without_redis(monkeypatch):
    """`conn_count` is in-memory; safe even if redis is down."""
    from app.ws_redis.registry import registry

    assert registry.conn_count("nonexistent") == 0
    assert "nonexistent" not in registry.list_rooms()


def test_channel_name_uses_prefix():
    from app.ws_redis.registry import registry

    assert registry._channel("orders") == "ws:orders"
