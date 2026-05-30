"""DRF serializers mirroring auth-core@v1."""
from rest_framework import serializers

from .models import User


class UserSerializer(serializers.ModelSerializer):
    # Stringified so the wire format matches the FastAPI side (which uses
    # 36-char UUID strings). When auth-core later moves Django's User to
    # UUIDField this becomes a no-op, but the contract stays string-typed.
    id = serializers.SerializerMethodField()
    emailVerified = serializers.BooleanField(source="email_verified", read_only=True)
    mfaEnabled = serializers.BooleanField(source="mfa_enabled", read_only=True)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "name",
            "phone",
            "role",
            "emailVerified",
            "mfaEnabled",
            "createdAt",
        ]
        read_only_fields = fields

    def get_id(self, obj) -> str:
        return str(obj.pk)


class ChangePasswordSerializer(serializers.Serializer):
    currentPassword = serializers.CharField(
        required=False, allow_null=True, allow_blank=True, write_only=True
    )
    newPassword = serializers.CharField(
        min_length=8, max_length=128, write_only=True
    )
