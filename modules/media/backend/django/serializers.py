"""DRF serializers mirroring media@v1."""
from rest_framework import serializers

from .models import Media


ALLOWED_KINDS = {"image", "video", "file"}
MAX_SIZE_BYTES = 26_214_400


class MediaSerializer(serializers.ModelSerializer):
    ownerId = serializers.CharField(source="owner_id", read_only=True)
    originalName = serializers.CharField(
        source="original_name", required=False, allow_null=True, allow_blank=True
    )
    mimeType = serializers.CharField(source="mime_type")
    sizeBytes = serializers.IntegerField(source="size_bytes", min_value=0)
    thumbUrl = serializers.CharField(
        source="thumb_url", required=False, allow_null=True, allow_blank=True
    )
    altText = serializers.CharField(
        source="alt_text", required=False, allow_null=True, allow_blank=True
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Media
        fields = [
            "id",
            "ownerId",
            "kind",
            "originalName",
            "mimeType",
            "sizeBytes",
            "url",
            "thumbUrl",
            "width",
            "height",
            "altText",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "ownerId", "createdAt", "updatedAt"]

    def validate_kind(self, value: str) -> str:
        if value not in ALLOWED_KINDS:
            raise serializers.ValidationError(
                f"kind must be one of {sorted(ALLOWED_KINDS)}"
            )
        return value

    def validate_sizeBytes(self, value: int) -> int:
        if value > MAX_SIZE_BYTES:
            raise serializers.ValidationError(
                f"sizeBytes exceeds the {MAX_SIZE_BYTES}-byte cap"
            )
        return value


class MediaListResponseSerializer(serializers.Serializer):
    items = MediaSerializer(many=True)
    total = serializers.IntegerField()
