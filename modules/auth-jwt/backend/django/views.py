"""auth-jwt Django views — /signup, /login.

Tokens minted via djangorestframework-simplejwt's ``RefreshToken.for_user``
so /me /logout /change-password (auth-core router) decode them transparently.

Same enumeration-safety contract as FastAPI side: AUTH_INVALID for both
'wrong password' and 'no such user'.
"""
from django.contrib.auth import get_user_model
from django.db import IntegrityError
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from auth_core.serializers import UserSerializer

from .serializers import LoginRequestSerializer, SignupRequestSerializer


User = get_user_model()


def _auth_response(user) -> dict:
    refresh = RefreshToken.for_user(user)
    access = refresh.access_token
    return {
        "user": UserSerializer(user).data,
        "session": {
            "token": str(access),
            "userId": str(user.id),
            "expiresAt": access["exp"],
        },
    }


class SignupView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        ser = SignupRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            user = User.objects.create_user(
                email=ser.validated_data["email"],
                password=ser.validated_data["password"],
                name=ser.validated_data.get("name"),
            )
        except IntegrityError:
            return Response(
                {
                    "code": "AUTH_EMAIL_TAKEN",
                    "message": "An account with this email already exists.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        return Response(_auth_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request: Request) -> Response:
        ser = LoginRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        email = ser.validated_data["email"].lower()
        password = ser.validated_data["password"]

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            user = None

        # Same code for unknown user + wrong password — prevents enumeration.
        if (
            user is None
            or not user.has_usable_password()
            or not user.check_password(password)
        ):
            return Response(
                {"code": "AUTH_INVALID", "message": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not user.is_active:
            return Response(
                {"code": "AUTH_USER_INACTIVE", "message": "Account is inactive."},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(_auth_response(user))
