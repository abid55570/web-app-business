"""Notification channel adapters — Django sync edition.

Same plug-points as the FastAPI side. Phase 2 ships in-app + stub-email
returning ``sent-test`` so contract tests stay deterministic without API keys.
"""
from abc import ABC, abstractmethod
from typing import Any
from uuid import uuid4


class NotificationAdapter(ABC):
    name: str
    channel: str

    @abstractmethod
    def send(
        self, recipient: str, template: str, data: dict[str, Any]
    ) -> dict[str, Any]:
        """Returns ``{ id, status, provider_response? }``."""


class InAppAdapter(NotificationAdapter):
    name = "in-app"
    channel = "in-app"

    def send(self, recipient, template, data):
        return {"id": uuid4().hex, "status": "sent-test"}


class StubEmailAdapter(NotificationAdapter):
    name = "stub-email"
    channel = "email"

    def send(self, recipient, template, data):
        return {"id": uuid4().hex, "status": "sent-test"}


_adapters: dict[str, NotificationAdapter] = {
    "in-app": InAppAdapter(),
    "email": StubEmailAdapter(),
}


def get_adapter(channel: str) -> NotificationAdapter | None:
    return _adapters.get(channel)


def register_adapter(adapter: NotificationAdapter) -> None:
    _adapters[adapter.channel] = adapter


def clear_adapters() -> None:
    _adapters.clear()
