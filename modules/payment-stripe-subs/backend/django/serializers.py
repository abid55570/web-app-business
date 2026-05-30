"""DRF serializers mirroring payment-stripe-subs@v1."""
import re

from rest_framework import serializers

from .models import Plan, Subscription


KEY_RE = re.compile(r"^[a-z0-9][a-z0-9._-]*$")
ALLOWED_INTERVALS = {"month", "year"}


class PlanSerializer(serializers.ModelSerializer):
    amountCents = serializers.IntegerField(source="amount_cents", min_value=0)
    stripePriceId = serializers.CharField(
        source="stripe_price_id", read_only=True, allow_null=True
    )
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Plan
        fields = [
            "id",
            "key",
            "name",
            "description",
            "amountCents",
            "currency",
            "interval",
            "stripePriceId",
            "active",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "stripePriceId", "createdAt", "updatedAt"]

    def validate_key(self, value: str) -> str:
        if not KEY_RE.match(value):
            raise serializers.ValidationError(
                "key must match [a-z0-9][a-z0-9._-]*"
            )
        return value

    def validate_interval(self, value: str) -> str:
        if value not in ALLOWED_INTERVALS:
            raise serializers.ValidationError(
                f"interval must be one of {sorted(ALLOWED_INTERVALS)}"
            )
        return value


class SubscriptionSerializer(serializers.ModelSerializer):
    customerRef = serializers.CharField(source="customer_ref")
    planKey = serializers.CharField(source="plan_key")
    stripeSubscriptionId = serializers.CharField(
        source="stripe_subscription_id", read_only=True, allow_null=True
    )
    trialEndsAt = serializers.DateTimeField(source="trial_ends_at", allow_null=True)
    currentPeriodStart = serializers.DateTimeField(
        source="current_period_start", allow_null=True
    )
    currentPeriodEnd = serializers.DateTimeField(
        source="current_period_end", allow_null=True
    )
    canceledAt = serializers.DateTimeField(source="canceled_at", allow_null=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Subscription
        fields = [
            "id",
            "customerRef",
            "planKey",
            "status",
            "stripeSubscriptionId",
            "trialEndsAt",
            "currentPeriodStart",
            "currentPeriodEnd",
            "canceledAt",
            "createdAt",
            "updatedAt",
        ]
        read_only_fields = ["id", "createdAt", "updatedAt"]


class CheckoutBodySerializer(serializers.Serializer):
    planKey = serializers.CharField(max_length=64)
    customerRef = serializers.CharField(max_length=36)
    successUrl = serializers.URLField()
    cancelUrl = serializers.URLField()


class PortalBodySerializer(serializers.Serializer):
    customerRef = serializers.CharField(max_length=36)
    returnUrl = serializers.URLField(required=False, allow_null=True)
