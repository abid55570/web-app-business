"""auth-oauth Django view — /api/auth/oauth/<provider>/callback.

Resolves the OAuth code through the (stub) provider, upserts the User
(linking on (provider, subject) → falling back to email match → otherwise
creating a fresh user), and mints a simplejwt access token in the same
``AuthResponse`` envelope as auth-jwt.
"""
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from auth_core.serializers import UserSerializer

from .providers import ProviderProfile, get_provider


User = get_user_model()


def _upsert(profile: ProviderProfile):
    """Resolution order: (provider, subject) link → email match → create."""
    by_link = User.objects.filter(
        oauth_provider=profile.provider, oauth_subject=profile.subject
    ).first()
    if by_link is not None:
        return by_link

    by_email = User.objects.filter(email=profile.email.lower()).first()
    if by_email is not None:
        by_email.oauth_provider = profile.provider
        by_email.oauth_subject = profile.subject
        if not by_email.email_verified:
            by_email.email_verified = True
        by_email.save(
            update_fields=["oauth_provider", "oauth_subject", "email_verified"]
        )
        return by_email

    user = User.objects.create_user(
        email=profile.email,
        password=None,  # OAuth-only; password set later via /change-password
        name=profile.name,
    )
    user.oauth_provider = profile.provider
    user.oauth_subject = profile.subject
    user.email_verified = True
    user.save(
        update_fields=["oauth_provider", "oauth_subject", "email_verified"]
    )
    return user


class OAuthCallbackView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, provider: str) -> Response:
        adapter = get_provider(provider)
        if adapter is None:
            return Response(
                {
                    "code": "AUTH_OAUTH_PROVIDER_UNKNOWN",
                    "message": f"Unknown OAuth provider: {provider}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        code = request.query_params.get("code", "")
        try:
            profile = adapter.exchange_code(code)
        except ValueError as exc:
            return Response(
                {
                    "code": "AUTH_OAUTH_CODE_INVALID",
                    "message": str(exc) or "OAuth callback code missing.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = _upsert(profile)
        refresh = RefreshToken.for_user(user)
        access = refresh.access_token
        return Response(
            {
                "user": UserSerializer(user).data,
                "session": {
                    "token": str(access),
                    "userId": str(user.id),
                    "expiresAt": access["exp"],
                },
            }
        )
