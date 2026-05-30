"""DRF serializer for NotificationLog — mirrors notifications@v1."""
from rest_framework import serializers

from .models import NotificationLog


class NotificationLogSerializer(serializers.ModelSerializer):
    providerId = serializers.CharField(source="provider_id", read_only=True, allow_null=True)
    triggeredByEvent = serializers.CharField(
        source="triggered_by_event", read_only=True, allow_null=True
    )
    sentAt = serializers.DateTimeField(source="sent_at", read_only=True)

    class Meta:
        model = NotificationLog
        fields = [
            "id",
            "channel",
            "recipient",
            "template",
            "payload",
            "status",
            "providerId",
            "error",
            "triggeredByEvent",
            "sentAt",
        ]


class NotificationListResponseSerializer(serializers.Serializer):
    notifications = NotificationLogSerializer(many=True)
    total = serializers.IntegerField()
