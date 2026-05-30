"""DRF serializers mirroring likes@v1."""
from rest_framework import serializers


class TargetRefSerializer(serializers.Serializer):
    targetType = serializers.CharField(max_length=64)
    targetId = serializers.CharField(max_length=255)


class LikeResponseSerializer(serializers.Serializer):
    targetType = serializers.CharField()
    targetId = serializers.CharField()
    liked = serializers.BooleanField()
    count = serializers.IntegerField()


class LikeCountSerializer(serializers.Serializer):
    targetType = serializers.CharField()
    targetId = serializers.CharField()
    count = serializers.IntegerField()
    likedByMe = serializers.BooleanField()


class MyLikeSerializer(serializers.Serializer):
    targetType = serializers.CharField()
    targetId = serializers.CharField()
    createdAt = serializers.DateTimeField()


class MyLikesResponseSerializer(serializers.Serializer):
    items = MyLikeSerializer(many=True)
    total = serializers.IntegerField()
