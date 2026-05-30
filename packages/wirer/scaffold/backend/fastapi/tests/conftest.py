"""Shared pytest fixtures for the generated app's smoke suite.

Module-level smoke tests live under ``tests/<module>/`` (e.g.
``tests/events_bus/``, ``tests/menu/``). Anything cross-cutting (ephemeral
DB, FastAPI test client, auth helpers) belongs here.

The DB fixture spins up an in-memory SQLite per test, creates all tables
registered against ``Base.metadata``, and overrides FastAPI's ``get_db``
dependency so every request inside the test sees the same session.
"""
from __future__ import annotations

import asyncio
from collections.abc import AsyncGenerator, Generator
from typing import Any

import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)


@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Single shared loop so async fixtures + tests don't fight each other."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Per-test in-memory SQLite session.

    Imports every module's model.py so SQLAlchemy registers tables before
    ``create_all`` runs. New module models added later get picked up
    automatically by the wirer's main.py imports.
    """
    # Ensure all module models are loaded into Base.metadata.
    from app import main  # noqa: F401 — triggers lifespan-time imports
    from app.database import Base

    engine = create_async_engine("sqlite+aiosqlite:///:memory:", future=True)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_maker = async_sessionmaker(engine, expire_on_commit=False)
    async with session_maker() as session:
        yield session

    await engine.dispose()


@pytest_asyncio.fixture
async def client(
    db_session: AsyncSession,
) -> AsyncGenerator[AsyncClient, None]:
    """FastAPI test client with ``get_db`` overridden to share ``db_session``.

    Re-runs ``register_adapters()`` + ``register_subscriptions()`` per test
    so handlers + adapter gateways are wired even though we bypass FastAPI's
    actual lifespan event when constructing AsyncClient with an ASGITransport.
    """
    from app._adapters import register_adapters
    from app._subscriptions import register_subscriptions
    from app.database import get_db
    from app.events_bus.bus import clear_subscribers
    from app.main import app

    async def _override_get_db() -> AsyncGenerator[AsyncSession, None]:
        yield db_session

    app.dependency_overrides[get_db] = _override_get_db
    clear_subscribers()
    register_adapters()
    register_subscriptions()

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    clear_subscribers()


@pytest_asyncio.fixture
async def make_user(
    db_session: AsyncSession,
):
    """Factory: create a user + return ``(user, bearer_header)``.

    Default role is ``customer``; pass ``role="admin"`` for admin-only routes.
    """
    from app.auth_core.model import User
    from app.auth_core.utils import create_session_token, hash_password

    async def _factory(
        email: str = "test@example.com",
        password: str = "password123",
        role: str = "customer",
        name: str | None = "Test",
    ) -> tuple[User, dict[str, str]]:
        user = User(
            email=email.lower(),
            password_hash=hash_password(password),
            name=name,
            role=role,
        )
        db_session.add(user)
        await db_session.commit()
        await db_session.refresh(user)
        token, _ = create_session_token(user.id)
        return user, {"Authorization": f"Bearer {token}"}

    return _factory


@pytest_asyncio.fixture
async def admin_headers(make_user) -> dict[str, str]:
    """Shortcut: an admin user already created, returns auth headers."""
    _, headers = await make_user(email="admin@example.com", role="admin")
    return headers


@pytest_asyncio.fixture
async def customer_headers(make_user) -> dict[str, str]:
    """Shortcut: a customer user already created, returns auth headers."""
    _, headers = await make_user(email="customer@example.com", role="customer")
    return headers


def _silence_unused(*_: Any) -> None:  # pragma: no cover
    """Reserved for future cross-cutting fixtures."""
