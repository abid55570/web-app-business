"""DRF serializers mirroring flags@v1."""
from rest_framework import serializers

from .models import Flag

ALLOWED_REASONS = {"spam", "abuse", "off-topic", "illegal", "other"}
ALLOWED_STATUSES = {"open", "resolved", "dismissed"}


class FlagSerializer(serializers.ModelSerializer):
    reporterId = serializers.CharField(source="reporter_id", read_only=True)
    targetType = serializers.CharField(source="target_type")
    targetId = serializers.CharField(source="target_id")
    resolverId = serializers.CharField(source="resolver_id", read_only=True)
    resolverNote = serializers.CharField(
        source="resolver_note", required=False, allow_null=True, allow_blank=True
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Flag
        fields = [
            "id",
            "reporterId",
            "targetType",
            "targetId",
            "reason",
            "status",
            "resolverId",
            "resolverNote",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = [
            "id",
            "reporterId",
            "status",
            "resolverId",
            "createdAt",
            "updatedAt",
        ]

    def validate_reason(self, value: str) -> str:
        if value not in ALLOWED_REASONS:
            raise serializers.ValidationError(
                f"reason must be one of {sorted(ALLOWED_REASONS)}"
            )
        return value


class ResolveBodySerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["resolved", "dismissed"])
    resolverNote = serializers.CharField(
        max_length=1000, required=False, allow_null=True, allow_blank=True
    )
