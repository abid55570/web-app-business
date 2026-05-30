"""auth-core views — /me, /logout, /change-password.

Strategy-specific entry routes (login/signup, OAuth callback) live in the
auth-jwt + auth-oauth Django apps.
"""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .serializers import ChangePasswordSerializer, UserSerializer


class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        return Response(UserSerializer(request.user).data)


class LogoutView(APIView):
    """Stateless — client discards the JWT. Future ``auth-revocable`` variant
    blacklists the token here via simplejwt's TokenBlacklistView."""

    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        return Response(status=status.HTTP_204_NO_CONTENT)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = ChangePasswordSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user = request.user
        current = ser.validated_data.get("currentPassword")
        if user.has_usable_password():
            if not current or not user.check_password(current):
                return Response(
                    {
                        "code": "AUTH_CURRENT_PASSWORD_INVALID",
                        "message": "Current password is required and must match.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
        user.set_password(ser.validated_data["newPassword"])
        user.save(update_fields=["password"])
        return Response(status=status.HTTP_204_NO_CONTENT)
