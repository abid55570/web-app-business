"""OAuth provider stubs — framework-agnostic.

Same shape as the FastAPI side; both stacks reuse the upsert + token-mint
contract. Real adapters (httpx + provider SDKs) replace these in Phase 2+.
"""
from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class ProviderProfile:
    provider: str
    subject: str
    email: str
    name: str | None = None


class OAuthProvider(ABC):
    name: str

    @abstractmethod
    def exchange_code(self, code: str) -> ProviderProfile:
        """Trade auth code for a canonical profile."""


class StubGoogleProvider(OAuthProvider):
    name = "google"

    def exchange_code(self, code: str) -> ProviderProfile:
        if not code:
            raise ValueError("empty code")
        return ProviderProfile(
            provider="google",
            subject=f"google_{code}",
            email=f"{code}@gmail.example",
            name="Google User",
        )


class StubGithubProvider(OAuthProvider):
    name = "github"

    def exchange_code(self, code: str) -> ProviderProfile:
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
    _providers[provider.name] = provider
