"""backup views — admin list / trigger / purge."""
import os
from datetime import datetime, timedelta, timezone

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import BackupJob
from .permissions import IsAdminRole
from .serializers import BackupJobSerializer, TriggerBodySerializer


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _do_dump() -> bytes:
    return b"-- stub dump --\n"


def _do_upload(bucket: str, key: str, data: bytes) -> int:
    return len(data)


class AdminBackupListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = BackupJob.objects.all().order_by("-created_at")
        if s := request.query_params.get("status"):
            qs = qs.filter(status=s)
        try:
            limit = int(request.query_params.get("limit", 100))
        except ValueError:
            limit = 100
        limit = max(1, min(limit, 500))
        items = list(qs[:limit])
        return Response(
            {
                "items": BackupJobSerializer(items, many=True).data,
                "total": len(items),
            }
        )


class AdminBackupTriggerView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request: Request) -> Response:
        ser = TriggerBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        job = BackupJob.objects.create(
            kind=ser.validated_data["kind"], status="queued"
        )

        bucket = os.getenv("BACKUP_S3_BUCKET")
        if not bucket:
            job.status = "failed"
            job.reason = "BACKUP_S3_BUCKET not set"
            job.finished_at = _now()
            job.save()
            return Response(
                BackupJobSerializer(job).data, status=status.HTTP_201_CREATED
            )

        job.status = "running"
        job.started_at = _now()
        job.save(update_fields=["status", "started_at"])

        try:
            data = _do_dump()
            ts = _now().strftime("%Y%m%dT%H%M%SZ")
            key = f"backups/{ts}-{job.id}.sql"
            size = _do_upload(bucket, key, data)
            job.status = "succeeded"
            job.s3_key = key
            job.size_bytes = size
            job.finished_at = _now()
            job.save()
        except Exception as e:  # noqa: BLE001
            job.status = "failed"
            job.reason = str(e)[:500]
            job.finished_at = _now()
            job.save()

        return Response(
            BackupJobSerializer(job).data, status=status.HTTP_201_CREATED
        )


class AdminBackupPurgeView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request: Request) -> Response:
        try:
            days = int(request.query_params.get("retentionDays", 30))
        except ValueError:
            days = 30
        days = max(1, min(days, 3650))
        cutoff = _now() - timedelta(days=days)
        qs = BackupJob.objects.filter(status="succeeded", created_at__lt=cutoff)
        count = qs.count()
        qs.delete()
        return Response({"purged": count})
