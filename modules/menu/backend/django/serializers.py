"""DRF serializers mirroring menu@v1.

camelCase wire format matches the FastAPI side: image_url ↔ imageUrl,
is_available ↔ isAvailable, etc. Pinned via ``source=`` so callers can
post either form (``populate_by_name`` parity with the Pydantic schemas).
"""
from rest_framework import serializers

from .models import MenuItem


class MenuItemSerializer(serializers.ModelSerializer):
    imageUrl = serializers.CharField(
        source="image_url", required=False, allow_null=True, allow_blank=True
    )
    isAvailable = serializers.BooleanField(source="is_available", required=False)
    sortOrder = serializers.IntegerField(source="sort_order", required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = MenuItem
        fields = [
            "id",
            "name",
            "description",
            "price",
            "currency",
            "imageUrl",
            "category",
            "isAvailable",
            "sortOrder",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "createdAt", "updatedAt"]


class MenuListResponseSerializer(serializers.Serializer):
    items = MenuItemSerializer(many=True)
    total = serializers.IntegerField()


class CategoryListResponseSerializer(serializers.Serializer):
    categories = serializers.ListField(child=serializers.CharField())


class AvailabilityToggleSerializer(serializers.Serializer):
    isAvailable = serializers.BooleanField()
