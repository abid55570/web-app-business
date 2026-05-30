"""DRF serializers mirroring boards@v1.

camelCase wire format matches the FastAPI side. Columns serialize to/from
JSON arrays even though the underlying column is a comma-separated string.
"""
import re

from rest_framework import serializers

from .models import Board, BoardCard


SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
DEFAULT_COLUMNS = ["todo", "doing", "done"]


def _split(csv: str) -> list[str]:
    return [c.strip() for c in csv.split(",") if c.strip()]


def _join(cols: list[str]) -> str:
    return ",".join(c.strip() for c in cols if c.strip())


class ColumnsField(serializers.Field):
    """CSV ↔ JSON array. Validates non-empty + unique on input."""

    def to_representation(self, value: str):
        return _split(value)

    def to_internal_value(self, data):
        if not isinstance(data, list) or not all(isinstance(c, str) for c in data):
            raise serializers.ValidationError("columns must be an array of strings")
        if not data:
            raise serializers.ValidationError("at least one column required")
        if len(data) != len(set(data)):
            raise serializers.ValidationError("column names must be unique")
        return _join(data)


class BoardSerializer(serializers.ModelSerializer):
    ownerId = serializers.CharField(source="owner_id", read_only=True)
    columns = ColumnsField(required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Board
        fields = [
            "id",
            "ownerId",
            "name",
            "slug",
            "description",
            "columns",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "ownerId", "createdAt", "updatedAt"]

    def validate_slug(self, value: str) -> str:
        if not SLUG_RE.match(value):
            raise serializers.ValidationError("slug must be kebab-case (a-z, 0-9, -).")
        return value


class CardSerializer(serializers.ModelSerializer):
    boardId = serializers.CharField(source="board_id", read_only=True)
    assigneeId = serializers.CharField(
        source="assignee_id", required=False, allow_null=True
    )
    dueAt = serializers.DateTimeField(source="due_at", required=False, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = BoardCard
        fields = [
            "id",
            "boardId",
            "title",
            "body",
            "status",
            "position",
            "assigneeId",
            "dueAt",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "boardId", "createdAt", "updatedAt"]


class CardMoveSerializer(serializers.Serializer):
    status = serializers.CharField(max_length=64)
    position = serializers.IntegerField(min_value=0)


class BoardDetailSerializer(BoardSerializer):
    cards = CardSerializer(many=True, read_only=True)

    class Meta(BoardSerializer.Meta):
        fields = BoardSerializer.Meta.fields + ["cards"]


class BoardListResponseSerializer(serializers.Serializer):
    items = BoardSerializer(many=True)
    total = serializers.IntegerField()
