"""DRF serializers mirroring backup@v1."""
from rest_framework import serializers

from .models import BackupJob


class BackupJobSerializer(serializers.ModelSerializer):
    s3Key = serializers.CharField(source="s3_key", allow_null=True, read_only=True)
    sizeBytes = serializers.IntegerField(source="size_bytes", read_only=True)
    startedAt = serializers.DateTimeField(source="started_at", read_only=True)
    finishedAt = serializers.DateTimeField(source="finished_at", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = BackupJob
        fields = [
            "id",
            "kind",
            "status",
            "s3Key",
            "sizeBytes",
            "startedAt",
            "finishedAt",
            "reason",
            "createdAt",
        ]


class TriggerBodySerializer(serializers.Serializer):
    kind = serializers.ChoiceField(
        choices=["scheduled", "manual", "restore"], default="manual"
    )
