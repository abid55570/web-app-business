"""DRF serializers mirroring notifications-push@v1."""
from rest_framework import serializers

from .models import PushSubscription


class SubscribeBodySerializer(serializers.Serializer):
    endpoint = serializers.CharField(min_length=1)
    p256dhKey = serializers.CharField(min_length=1, max_length=255)
    authKey = serializers.CharField(min_length=1, max_length=255)


class SubscriptionSerializer(serializers.ModelSerializer):
    userId = serializers.CharField(source="user_id", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = PushSubscription
        fields = ["id", "userId", "endpoint", "createdAt", "updatedAt"]
        read_only_fields = ["id", "userId", "createdAt", "updatedAt"]


class SendBodySerializer(serializers.Serializer):
    userId = serializers.CharField(min_length=1)
    payload = serializers.JSONField()
