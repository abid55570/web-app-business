"""DRF serializers mirroring posts@v1.

camelCase wire format matches the FastAPI side (author_id ↔ authorId,
published_at ↔ publishedAt, cover_url ↔ coverUrl).
"""
import re

from rest_framework import serializers

from .models import Post


SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
ALLOWED_STATUS = {"draft", "published", "archived"}


class PostSerializer(serializers.ModelSerializer):
    authorId = serializers.CharField(source="author_id", read_only=True)
    coverUrl = serializers.CharField(
        source="cover_url", required=False, allow_null=True, allow_blank=True
    )
    publishedAt = serializers.DateTimeField(source="published_at", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Post
        fields = [
            "id",
            "authorId",
            "title",
            "slug",
            "body",
            "excerpt",
            "coverUrl",
            "status",
            "publishedAt",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "authorId", "publishedAt", "createdAt", "updatedAt"]

    def validate_slug(self, value: str) -> str:
        if not SLUG_RE.match(value):
            raise serializers.ValidationError("slug must be kebab-case (a-z, 0-9, -).")
        return value

    def validate_status(self, value: str) -> str:
        if value not in ALLOWED_STATUS:
            raise serializers.ValidationError(
                f"status must be one of {sorted(ALLOWED_STATUS)}."
            )
        return value


class PostListResponseSerializer(serializers.Serializer):
    items = PostSerializer(many=True)
    total = serializers.IntegerField()


class StatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=sorted(ALLOWED_STATUS))
