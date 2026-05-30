"""audit-log views — public record, admin read with filters."""
import json

from django.utils.dateparse import parse_datetime

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import AuditEntry
from .permissions import IsAdminRole
from .serializers import AuditRecordBodySerializer, AuditResponseSerializer


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _client_ip(request: Request) -> str | None:
    xff = request.META.get("HTTP_X_FORWARDED_FOR")
    if xff:
        return xff.split(",")[0].strip()
    return request.META.get("REMOTE_ADDR")


class PublicAuditRecordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = AuditRecordBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        entry = AuditEntry.objects.create(
            actor_id=_uid(request),
            action=ser.validated_data["action"],
            target_type=ser.validated_data.get("targetType"),
            target_id=ser.validated_data.get("targetId"),
            metadata=json.dumps(ser.validated_data.get("metadata") or {}),
            ip_address=_client_ip(request),
            user_agent=request.META.get("HTTP_USER_AGENT"),
        )
        return Response(
            AuditResponseSerializer(entry).data, status=status.HTTP_201_CREATED
        )


class AdminAuditListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = AuditEntry.objects.all().order_by("-created_at")
        if v := request.query_params.get("actorId"):
            qs = qs.filter(actor_id=v)
        if v := request.query_params.get("action"):
            qs = qs.filter(action=v)
        if v := request.query_params.get("targetType"):
            qs = qs.filter(target_type=v)
        if v := request.query_params.get("targetId"):
            qs = qs.filter(target_id=v)
        if v := request.query_params.get("from"):
            dt = parse_datetime(v)
            if dt:
                qs = qs.filter(created_at__gte=dt)
        if v := request.query_params.get("to"):
            dt = parse_datetime(v)
            if dt:
                qs = qs.filter(created_at__lte=dt)
        try:
            limit = int(request.query_params.get("limit", 200))
        except ValueError:
            limit = 200
        limit = max(1, min(limit, 1000))
        items = list(qs[:limit])
        return Response(
            {
                "items": AuditResponseSerializer(items, many=True).data,
                "total": len(items),
            }
        )
