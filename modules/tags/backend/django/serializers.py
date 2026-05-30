"""DRF serializers mirroring tags@v1."""
import re

from rest_framework import serializers

from .models import Tag


SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
HEX_RE = re.compile(r"^#[0-9a-fA-F]{3,8}$")


class TagSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Tag
        fields = [
            "id",
            "slug",
            "label",
            "description",
            "color",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "createdAt", "updatedAt"]

    def validate_slug(self, value: str) -> str:
        if not SLUG_RE.match(value):
            raise serializers.ValidationError("slug must be kebab-case.")
        return value

    def validate_color(self, value: str | None) -> str | None:
        if value is None or value == "":
            return None
        if not HEX_RE.match(value):
            raise serializers.ValidationError("color must be a hex like '#a1b2c3'.")
        return value


class AssignBodySerializer(serializers.Serializer):
    tagId = serializers.CharField(max_length=36)
    targetType = serializers.CharField(max_length=64)
    targetId = serializers.CharField(max_length=255)


class TagListResponseSerializer(serializers.Serializer):
    items = TagSerializer(many=True)
    total = serializers.IntegerField()
