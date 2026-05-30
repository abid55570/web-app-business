"""Request schemas for password-based entry."""
from rest_framework import serializers


class SignupRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(min_length=8, max_length=128, write_only=True)
    name = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class LoginRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
