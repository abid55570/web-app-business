"""feature-flags views — public check + admin CRUD."""
import hashlib
import json

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import FeatureFlag
from .permissions import IsAdminRole
from .serializers import FlagSerializer


def _bucket(key: str, audience: str) -> int:
    h = hashlib.sha1(f"{key}:{audience}".encode("utf-8")).hexdigest()
    return int(h[:8], 16) % 100


def _resolve(flag: FeatureFlag, audience: str | None) -> bool:
    if not flag.enabled:
        return False
    try:
        audiences = json.loads(flag.audiences or "[]")
    except json.JSONDecodeError:
        audiences = []
    if audience and audience in audiences:
        return True
    if flag.rollout_percent >= 100:
        return True
    if flag.rollout_percent > 0 and audience:
        return _bucket(flag.key, audience) < flag.rollout_percent
    if flag.rollout_percent == 0 and not audiences:
        return True
    return False


class PublicCheckView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, key: str) -> Response:
        try:
            flag = FeatureFlag.objects.get(key=key)
            enabled = _resolve(flag, request.query_params.get("audience"))
        except FeatureFlag.DoesNotExist:
            enabled = False
        return Response(
            {
                "key": key,
                "enabled": enabled,
                "audience": request.query_params.get("audience"),
            }
        )


class PublicListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        audience = request.query_params.get("audience")
        flags = list(FeatureFlag.objects.all().order_by("key"))
        items = [
            {"key": f.key, "enabled": _resolve(f, audience)} for f in flags
        ]
        return Response({"items": items, "total": len(items)})


class AdminListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, _request: Request) -> Response:
        items = list(FeatureFlag.objects.all().order_by("key"))
        return Response(
            {"items": FlagSerializer(items, many=True).data, "total": len(items)}
        )

    def post(self, request: Request) -> Response:
        ser = FlagSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if FeatureFlag.objects.filter(key=ser.validated_data["key"]).exists():
            return Response(
                {
                    "code": "FLAG_KEY_TAKEN",
                    "message": f"Key '{ser.validated_data['key']}' is already in use.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        flag = ser.save()
        return Response(FlagSerializer(flag).data, status=status.HTTP_201_CREATED)


class AdminItemView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request: Request, flag_id: str) -> Response:
        try:
            flag = FeatureFlag.objects.get(pk=flag_id)
        except FeatureFlag.DoesNotExist:
            return Response(
                {"code": "FLAG_NOT_FOUND", "message": "Feature flag not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = FlagSerializer(flag, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        flag = ser.save()
        return Response(FlagSerializer(flag).data)

    def delete(self, _request: Request, flag_id: str) -> Response:
        try:
            flag = FeatureFlag.objects.get(pk=flag_id)
        except FeatureFlag.DoesNotExist:
            return Response(
                {"code": "FLAG_NOT_FOUND", "message": "Feature flag not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        flag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
