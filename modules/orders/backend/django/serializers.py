"""DRF serializers mirroring orders@v1."""
from rest_framework import serializers

from .models import Order


class OrderItemInputSerializer(serializers.Serializer):
    itemId = serializers.CharField()
    qty = serializers.IntegerField(min_value=1)


class OrderCreateRequestSerializer(serializers.Serializer):
    items = serializers.ListField(child=OrderItemInputSerializer(), min_length=1)
    notes = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class OrderStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(
        choices=[
            "pending",
            "confirmed",
            "preparing",
            "ready",
            "completed",
            "cancelled",
        ]
    )


class OrderResponseSerializer(serializers.ModelSerializer):
    id = serializers.SerializerMethodField()
    customerId = serializers.CharField(source="customer_id", read_only=True)
    paymentStatus = serializers.CharField(source="payment_status", read_only=True)
    paymentId = serializers.CharField(source="payment_id", read_only=True, allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Order
        fields = [
            "id",
            "customerId",
            "items",
            "subtotal",
            "tax",
            "discount",
            "total",
            "currency",
            "status",
            "paymentStatus",
            "paymentId",
            "notes",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = fields

    def get_id(self, obj) -> str:
        return str(obj.pk)
