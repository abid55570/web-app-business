"""DRF serializers mirroring audit-log@v1."""
import json

from rest_framework import serializers


class AuditRecordBodySerializer(serializers.Serializer):
    action = serializers.CharField(max_length=128, min_length=1)
    targetType = serializers.CharField(max_length=64, required=False, allow_null=True)
    targetId = serializers.CharField(max_length=255, required=False, allow_null=True)
    metadata = serializers.JSONField(required=False, allow_null=True)


class AuditResponseSerializer(serializers.Serializer):
    id = serializers.CharField()
    actorId = serializers.CharField(source="actor_id")
    action = serializers.CharField()
    targetType = serializers.CharField(source="target_type", allow_null=True)
    targetId = serializers.CharField(source="target_id", allow_null=True)
    metadata = serializers.SerializerMethodField()
    ip = serializers.CharField(source="ip_address", allow_null=True)
    userAgent = serializers.CharField(source="user_agent", allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at")

    def get_metadata(self, obj):
        try:
            return json.loads(obj.metadata) if obj.metadata else {}
        except (json.JSONDecodeError, AttributeError):
            return {}


class AuditListResponseSerializer(serializers.Serializer):
    items = AuditResponseSerializer(many=True)
    total = serializers.IntegerField()
