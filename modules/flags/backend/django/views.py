"""flags views — public open (auth), admin queue + resolve."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Flag
from .permissions import IsAdminRole
from .serializers import FlagSerializer, ResolveBodySerializer


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


class PublicFlagOpenView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = FlagSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tt = ser.validated_data["target_type"]
        tid = ser.validated_data["target_id"]
        reason = ser.validated_data["reason"]
        existing = Flag.objects.filter(
            reporter_id=_uid(request), target_type=tt, target_id=tid
        ).first()
        if existing:
            return Response(FlagSerializer(existing).data, status=status.HTTP_201_CREATED)
        f = Flag.objects.create(
            reporter_id=_uid(request),
            target_type=tt,
            target_id=tid,
            reason=reason,
        )
        return Response(FlagSerializer(f).data, status=status.HTTP_201_CREATED)


class AdminFlagListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = Flag.objects.all().order_by("-created_at")
        if s := request.query_params.get("status"):
            qs = qs.filter(status=s)
        if tt := request.query_params.get("targetType"):
            qs = qs.filter(target_type=tt)
        items = list(qs)
        return Response(
            {"items": FlagSerializer(items, many=True).data, "total": len(items)}
        )


class AdminFlagForTargetView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        tt = request.query_params.get("targetType")
        tid = request.query_params.get("targetId")
        if not tt or not tid:
            return Response(
                {
                    "code": "FLAG_TARGET_REQUIRED",
                    "message": "targetType and targetId query params are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = Flag.objects.filter(target_type=tt, target_id=tid).order_by(
            "-created_at"
        )
        items = list(qs)
        return Response(
            {"items": FlagSerializer(items, many=True).data, "total": len(items)}
        )


class AdminFlagResolveView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request: Request, flag_id: str) -> Response:
        try:
            flag = Flag.objects.get(pk=flag_id)
        except Flag.DoesNotExist:
            return Response(
                {"code": "FLAG_NOT_FOUND", "message": "Flag not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = ResolveBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        flag.status = ser.validated_data["status"]
        flag.resolver_id = _uid(request)
        flag.resolver_note = ser.validated_data.get("resolverNote")
        flag.save(
            update_fields=["status", "resolver_id", "resolver_note", "updated_at"]
        )
        return Response(FlagSerializer(flag).data)
