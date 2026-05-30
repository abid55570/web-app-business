"""DRF serializers mirroring comments@v1.

camelCase wire format matches the FastAPI side (author_id ↔ authorId,
target_type ↔ targetType, target_id ↔ targetId, parent_id ↔ parentId).
"""
from rest_framework import serializers

from .models import Comment


ALLOWED_STATUS = {"visible", "hidden", "flagged"}
MAX_BODY = 2000


class CommentSerializer(serializers.ModelSerializer):
    authorId = serializers.CharField(source="author_id", read_only=True)
    targetType = serializers.CharField(source="target_type")
    targetId = serializers.CharField(source="target_id")
    parentId = serializers.CharField(
        source="parent_id", required=False, allow_null=True
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)
    status = serializers.CharField(read_only=True)
    body = serializers.CharField(max_length=MAX_BODY, min_length=1)

    class Meta:
        model = Comment
        fields = [
            "id",
            "authorId",
            "targetType",
            "targetId",
            "parentId",
            "body",
            "status",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "authorId", "status", "createdAt", "updatedAt"]


class CommentUpdateSerializer(serializers.Serializer):
    body = serializers.CharField(max_length=MAX_BODY, min_length=1)


class StatusChangeSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=sorted(ALLOWED_STATUS))


class CommentListResponseSerializer(serializers.Serializer):
    items = CommentSerializer(many=True)
    total = serializers.IntegerField()
