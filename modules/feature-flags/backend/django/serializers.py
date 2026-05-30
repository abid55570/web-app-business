"""DRF serializers mirroring feature-flags@v1."""
import json
import re

from rest_framework import serializers

from .models import FeatureFlag


KEY_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")


class AudiencesField(serializers.Field):
    """JSON-array round-trip for the underlying TEXT column."""

    def to_representation(self, value: str) -> list[str]:
        try:
            return json.loads(value) if value else []
        except json.JSONDecodeError:
            return []

    def to_internal_value(self, data) -> str:
        if not isinstance(data, list) or not all(isinstance(a, str) for a in data):
            raise serializers.ValidationError(
                "audiences must be an array of strings"
            )
        return json.dumps(data)


class FlagSerializer(serializers.ModelSerializer):
    rolloutPercent = serializers.IntegerField(
        source="rollout_percent", min_value=0, max_value=100, required=False
    )
    audiences = AudiencesField(required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = FeatureFlag
        fields = [
            "id",
            "key",
            "description",
            "enabled",
            "rolloutPercent",
            "audiences",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "createdAt", "updatedAt"]

    def validate_key(self, value: str) -> str:
        if not KEY_RE.match(value):
            raise serializers.ValidationError(
                "key must match [a-z0-9][a-z0-9._-]*"
            )
        return value


class FlagListResponseSerializer(serializers.Serializer):
    items = FlagSerializer(many=True)
    total = serializers.IntegerField()


class CheckResponseSerializer(serializers.Serializer):
    key = serializers.CharField()
    enabled = serializers.BooleanField()
    audience = serializers.CharField(allow_null=True)
