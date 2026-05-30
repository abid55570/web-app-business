"""comments views — public read/write (self-owned) + admin moderation.

Mirrors the FastAPI dual-router shape: /api/comments is public; admin
moderation lives under /api/admin/comments/*. Self-edit + self-delete
checks run inside the public view; status transitions are admin-only.
"""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Comment
from .permissions import IsAdminRole
from .serializers import (
    CommentSerializer,
    CommentUpdateSerializer,
    StatusChangeSerializer,
)


def _user_id(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


# ─────────── public ───────────


class PublicCommentListCreateView(APIView):
    """GET = list visible for (targetType,targetId); POST = create as current user."""

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAuthenticated()]
        return [AllowAny()]

    def get(self, request: Request) -> Response:
        target_type = request.query_params.get("targetType")
        target_id = request.query_params.get("targetId")
        if not target_type or not target_id:
            return Response(
                {
                    "code": "COMMENT_TARGET_REQUIRED",
                    "message": "targetType and targetId query params are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        qs = (
            Comment.objects.filter(
                target_type=target_type, target_id=target_id, status="visible"
            )
            .order_by("created_at")
        )
        items = list(qs)
        return Response(
            {"items": CommentSerializer(items, many=True).data, "total": len(items)}
        )

    def post(self, request: Request) -> Response:
        ser = CommentSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        parent_id = ser.validated_data.get("parent_id")
        if parent_id:
            try:
                parent = Comment.objects.get(pk=parent_id)
            except Comment.DoesNotExist:
                return Response(
                    {"code": "COMMENT_NOT_FOUND", "message": "Parent comment not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )
            if (
                parent.target_type != ser.validated_data["target_type"]
                or parent.target_id != ser.validated_data["target_id"]
            ):
                return Response(
                    {
                        "code": "COMMENT_PARENT_MISMATCH",
                        "message": "Parent comment belongs to a different target.",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        comment = Comment.objects.create(
            author_id=_user_id(request),
            target_type=ser.validated_data["target_type"],
            target_id=ser.validated_data["target_id"],
            parent_id=parent_id,
            body=ser.validated_data["body"],
        )
        return Response(CommentSerializer(comment).data, status=status.HTTP_201_CREATED)


class PublicCommentView(APIView):
    """PATCH (self-edit) / DELETE (self-delete) — author only."""

    permission_classes = [IsAuthenticated]

    def _get_or_404(self, comment_id: str) -> Comment | Response:
        try:
            return Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            return Response(
                {"code": "COMMENT_NOT_FOUND", "message": "Comment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def patch(self, request: Request, comment_id: str) -> Response:
        got = self._get_or_404(comment_id)
        if isinstance(got, Response):
            return got
        if got.author_id != _user_id(request):
            return Response(
                {
                    "code": "AUTH_FORBIDDEN",
                    "message": "Only the comment author can edit this comment.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        ser = CommentUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        got.body = ser.validated_data["body"]
        got.save(update_fields=["body", "updated_at"])
        return Response(CommentSerializer(got).data)

    def delete(self, request: Request, comment_id: str) -> Response:
        got = self._get_or_404(comment_id)
        if isinstance(got, Response):
            return got
        if got.author_id != _user_id(request):
            return Response(
                {
                    "code": "AUTH_FORBIDDEN",
                    "message": "Only the comment author can delete this comment.",
                },
                status=status.HTTP_403_FORBIDDEN,
            )
        got.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────── admin ───────────


class AdminCommentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = Comment.objects.all().order_by("-created_at")
        status_filter = request.query_params.get("status")
        target_type = request.query_params.get("targetType")
        if status_filter:
            qs = qs.filter(status=status_filter)
        if target_type:
            qs = qs.filter(target_type=target_type)
        items = list(qs)
        return Response(
            {"items": CommentSerializer(items, many=True).data, "total": len(items)}
        )


class AdminCommentStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request: Request, comment_id: str) -> Response:
        try:
            comment = Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            return Response(
                {"code": "COMMENT_NOT_FOUND", "message": "Comment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = StatusChangeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        comment.status = ser.validated_data["status"]
        comment.save(update_fields=["status", "updated_at"])
        return Response(CommentSerializer(comment).data)


class AdminCommentDeleteView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def delete(self, _request: Request, comment_id: str) -> Response:
        try:
            comment = Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            return Response(
                {"code": "COMMENT_NOT_FOUND", "message": "Comment not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
