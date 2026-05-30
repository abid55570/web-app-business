"""OAuth provider registry — pluggable per-provider adapters.

Phase 1 ships stub implementations that don't actually call the provider —
they accept any non-empty ``code`` and return a deterministic profile so the
end-to-end wiring (callback → user upsert → session token) is testable.
Real adapters (httpx + token exchange) land in Phase 2.

Adding a new provider: subclass ``OAuthProvider``, return ``ProviderProfile``
from ``exchange_code()``, and register an instance in ``_providers`` below.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ProviderProfile:
    provider: str          # "google", "github", ...
    subject: str           # provider-side stable user id
    email: str
    name: str | None = None


class OAuthProvider(ABC):
    name: str

    @abstractmethod
    async def exchange_code(self, code: str) -> ProviderProfile:
        """Trade auth code for an access token + canonical profile."""


class StubGoogleProvider(OAuthProvider):
    name = "google"

    async def exchange_code(self, code: str) -> ProviderProfile:
        if not code:
            raise ValueError("empty code")
        # Deterministic stub identity keyed off the code so tests can assert.
        return ProviderProfile(
            provider="google",
            subject=f"google_{code}",
            email=f"{code}@gmail.example",
            name="Google User",
        )


class StubGithubProvider(OAuthProvider):
    name = "github"

    async def exchange_code(self, code: str) -> ProviderProfile:
        if not code:
            raise ValueError("empty code")
        return ProviderProfile(
            provider="github",
            subject=f"github_{code}",
            email=f"{code}@users.noreply.github.example",
            name=None,
        )


_providers: dict[str, OAuthProvider] = {
    "google": StubGoogleProvider(),
    "github": StubGithubProvider(),
}


def get_provider(name: str) -> OAuthProvider | None:
    return _providers.get(name)


def register_provider(provider: OAuthProvider) -> None:
    """Test hook + future Phase-2 entry point for real adapters."""
    _providers[provider.name] = provider
