"""DRF serializers mirroring tenants@v1."""
import re

from rest_framework import serializers

from .models import Tenant, TenantMember


SLUG_RE = re.compile(r"^[a-z0-9][a-z0-9-]*$")
ALLOWED_ROLES = {"owner", "admin", "member"}


class TenantSerializer(serializers.ModelSerializer):
    ownerId = serializers.CharField(source="owner_id", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = Tenant
        fields = ["id", "ownerId", "name", "slug", "plan", "createdAt", "updatedAt"]
        read_only_fields = ["id", "ownerId", "createdAt", "updatedAt"]

    def validate_slug(self, value: str) -> str:
        if not SLUG_RE.match(value):
            raise serializers.ValidationError("slug must be kebab-case.")
        return value


class MemberSerializer(serializers.ModelSerializer):
    tenantId = serializers.CharField(source="tenant_id", read_only=True)
    userId = serializers.CharField(source="user_id")
    invitedBy = serializers.CharField(
        source="invited_by", required=False, allow_null=True
    )
    joinedAt = serializers.DateTimeField(source="joined_at", read_only=True)

    class Meta:
        model = TenantMember
        fields = ["id", "tenantId", "userId", "role", "invitedBy", "joinedAt"]
        read_only_fields = ["id", "tenantId", "joinedAt"]

    def validate_role(self, value: str) -> str:
        if value not in ALLOWED_ROLES:
            raise serializers.ValidationError(
                f"role must be one of {sorted(ALLOWED_ROLES)}"
            )
        return value


class RoleChangeSerializer(serializers.Serializer):
    role = serializers.ChoiceField(choices=sorted(ALLOWED_ROLES))


class TenantListResponseSerializer(serializers.Serializer):
    items = TenantSerializer(many=True)
    total = serializers.IntegerField()


class MemberListResponseSerializer(serializers.Serializer):
    items = MemberSerializer(many=True)
    total = serializers.IntegerField()
