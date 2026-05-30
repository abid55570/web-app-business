"""DRF serializers mirroring bookmarks@v1."""
from rest_framework import serializers

from .models import Bookmark


MAX_NOTE = 1000


class BookmarkSerializer(serializers.ModelSerializer):
    targetType = serializers.CharField(source="target_type")
    targetId = serializers.CharField(source="target_id")
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    note = serializers.CharField(
        max_length=MAX_NOTE, required=False, allow_null=True, allow_blank=True
    )

    class Meta:
        model = Bookmark
        fields = [
            "id",
            "targetType",
            "targetId",
            "note",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "createdAt", "updatedAt"]


class BookmarkListResponseSerializer(serializers.Serializer):
    items = BookmarkSerializer(many=True)
    total = serializers.IntegerField()


class CheckResponseSerializer(serializers.Serializer):
    targetType = serializers.CharField()
    targetId = serializers.CharField()
    bookmarked = serializers.BooleanField()
