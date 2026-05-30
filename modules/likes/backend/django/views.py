"""likes views — single router, auth-required for writes, anon-tolerant
for-target reads.
"""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Like
from .serializers import TargetRefSerializer


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _count(target_type: str, target_id: str) -> int:
    return Like.objects.filter(
        target_type=target_type, target_id=target_id
    ).count()


class ToggleLikeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = TargetRefSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tt = ser.validated_data["targetType"]
        tid = ser.validated_data["targetId"]
        existing = Like.objects.filter(
            user_id=_uid(request), target_type=tt, target_id=tid
        ).first()
        if existing is None:
            Like.objects.create(user_id=_uid(request), target_type=tt, target_id=tid)
            liked = True
        else:
            existing.delete()
            liked = False
        return Response(
            {
                "targetType": tt,
                "targetId": tid,
                "liked": liked,
                "count": _count(tt, tid),
            }
        )

    def delete(self, request: Request) -> Response:
        tt = request.query_params.get("targetType")
        tid = request.query_params.get("targetId")
        if not tt or not tid:
            return Response(
                {
                    "code": "LIKE_TARGET_REQUIRED",
                    "message": "targetType and targetId query params are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        Like.objects.filter(
            user_id=_uid(request), target_type=tt, target_id=tid
        ).delete()
        return Response(
            {
                "targetType": tt,
                "targetId": tid,
                "liked": False,
                "count": _count(tt, tid),
            }
        )


class ForTargetView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        tt = request.query_params.get("targetType")
        tid = request.query_params.get("targetId")
        if not tt or not tid:
            return Response(
                {
                    "code": "LIKE_TARGET_REQUIRED",
                    "message": "targetType and targetId query params are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        mine = False
        if request.user and request.user.is_authenticated:
            mine = Like.objects.filter(
                user_id=_uid(request), target_type=tt, target_id=tid
            ).exists()
        return Response(
            {
                "targetType": tt,
                "targetId": tid,
                "count": _count(tt, tid),
                "likedByMe": mine,
            }
        )


class MyLikesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        qs = Like.objects.filter(user_id=_uid(request)).order_by("-created_at")
        target_type = request.query_params.get("targetType")
        if target_type:
            qs = qs.filter(target_type=target_type)
        items = [
            {
                "targetType": l.target_type,
                "targetId": l.target_id,
                "createdAt": l.created_at.isoformat(),
            }
            for l in qs
        ]
        return Response({"items": items, "total": len(items)})
