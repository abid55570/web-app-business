"""NotificationAdapter ABC + in-app/stub-email impls.

Real channel adapters (notifications-sendgrid, notifications-twilio, ...)
implement this ABC and register via register_adapter() at startup.
Test-mode (no API key) MUST return ``sent-test`` rather than failing —
keeps integration tests deterministic.
"""
from abc import ABC, abstractmethod
from typing import Any
from uuid import uuid4


class NotificationAdapter(ABC):
    name: str
    channel: str

    @abstractmethod
    async def send(
        self, recipient: str, template: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Returns ``{ id, status, provider_response? }``."""


class InAppAdapter(NotificationAdapter):
    name = "in-app"
    channel = "in-app"

    async def send(self, recipient, template, data):
        return {"id": uuid4().hex, "status": "sent-test"}


class StubEmailAdapter(NotificationAdapter):
    name = "stub-email"
    channel = "email"

    async def send(self, recipient, template, data):
        return {"id": uuid4().hex, "status": "sent-test"}


_adapters: dict[str, NotificationAdapter] = {
    "in-app": InAppAdapter(),
    "email": StubEmailAdapter(),
}


def get_adapter(channel: str) -> NotificationAdapter | None:
    return _adapters.get(channel)


def register_adapter(adapter: NotificationAdapter) -> None:
    """Test hook + integration startup."""
    _adapters[adapter.channel] = adapter


def clear_adapters() -> None:
    """Test hook only."""
    _adapters.clear()
