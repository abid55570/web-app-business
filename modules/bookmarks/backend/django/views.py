"""bookmarks views — single router, every endpoint is user-scoped."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Bookmark
from .serializers import BookmarkSerializer


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _missing_params() -> Response:
    return Response(
        {
            "code": "BOOKMARK_TARGET_REQUIRED",
            "message": "targetType and targetId query params are required.",
        },
        status=status.HTTP_400_BAD_REQUEST,
    )


class BookmarkSaveView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = BookmarkSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tt = ser.validated_data["target_type"]
        tid = ser.validated_data["target_id"]
        note = ser.validated_data.get("note")
        existing = Bookmark.objects.filter(
            user_id=_uid(request), target_type=tt, target_id=tid
        ).first()
        if existing:
            if note is not None and note != existing.note:
                existing.note = note
                existing.save(update_fields=["note", "updated_at"])
            return Response(BookmarkSerializer(existing).data)
        bm = Bookmark.objects.create(
            user_id=_uid(request),
            target_type=tt,
            target_id=tid,
            note=note,
        )
        return Response(BookmarkSerializer(bm).data, status=status.HTTP_201_CREATED)

    def delete(self, request: Request) -> Response:
        tt = request.query_params.get("targetType")
        tid = request.query_params.get("targetId")
        if not tt or not tid:
            return _missing_params()
        Bookmark.objects.filter(
            user_id=_uid(request), target_type=tt, target_id=tid
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookmarkCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        tt = request.query_params.get("targetType")
        tid = request.query_params.get("targetId")
        if not tt or not tid:
            return _missing_params()
        bookmarked = Bookmark.objects.filter(
            user_id=_uid(request), target_type=tt, target_id=tid
        ).exists()
        return Response({"targetType": tt, "targetId": tid, "bookmarked": bookmarked})


class MyBookmarksView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        qs = Bookmark.objects.filter(user_id=_uid(request)).order_by("-created_at")
        target_type = request.query_params.get("targetType")
        if target_type:
            qs = qs.filter(target_type=target_type)
        items = list(qs)
        return Response(
            {"items": BookmarkSerializer(items, many=True).data, "total": len(items)}
        )
