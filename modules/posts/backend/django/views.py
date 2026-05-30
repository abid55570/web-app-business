"""posts views — public list/get + admin CRUD.

Mirrors the FastAPI dual-router shape: /api/posts is public (status=published
only); /api/admin/posts/* requires role ∈ {admin, owner}. authorId is
stamped from `request.user.id` on create — never accepted from the body.
"""
from django.utils import timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Post
from .permissions import IsAdminRole
from .serializers import PostSerializer, StatusChangeSerializer


# ─────────── public ───────────


class PublicPostListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        qs = Post.objects.filter(status="published").order_by("-published_at", "-created_at")
        author_id = request.query_params.get("authorId")
        if author_id:
            qs = qs.filter(author_id=author_id)
        items = list(qs)
        return Response(
            {
                "items": PostSerializer(items, many=True).data,
                "total": len(items),
            }
        )


class PublicPostView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request, slug: str) -> Response:
        try:
            post = Post.objects.get(slug=slug, status="published")
        except Post.DoesNotExist:
            return Response(
                {"code": "POST_NOT_FOUND", "message": "Post not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(PostSerializer(post).data)


# ─────────── admin ───────────


class AdminPostListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = Post.objects.all().order_by("-created_at")
        status_filter = request.query_params.get("status")
        if status_filter:
            qs = qs.filter(status=status_filter)
        items = list(qs)
        return Response(
            {
                "items": PostSerializer(items, many=True).data,
                "total": len(items),
            }
        )

    def post(self, request: Request) -> Response:
        ser = PostSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        # Enforce slug uniqueness with friendly error code
        slug = ser.validated_data["slug"]
        if Post.objects.filter(slug=slug).exists():
            return Response(
                {"code": "POST_SLUG_TAKEN", "message": f"Slug '{slug}' is already in use."},
                status=status.HTTP_409_CONFLICT,
            )

        published_at = (
            timezone.now()
            if ser.validated_data.get("status") == "published"
            else None
        )
        post = Post.objects.create(
            author_id=str(getattr(request.user, "id", "")),
            title=ser.validated_data["title"],
            slug=slug,
            body=ser.validated_data["body"],
            excerpt=ser.validated_data.get("excerpt"),
            cover_url=ser.validated_data.get("cover_url"),
            status=ser.validated_data.get("status", "draft"),
            published_at=published_at,
        )
        return Response(PostSerializer(post).data, status=status.HTTP_201_CREATED)


class AdminPostView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def _get_or_404(self, post_id: str) -> Post | Response:
        try:
            return Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response(
                {"code": "POST_NOT_FOUND", "message": "Post not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get(self, _request: Request, post_id: str) -> Response:
        got = self._get_or_404(post_id)
        if isinstance(got, Response):
            return got
        return Response(PostSerializer(got).data)

    def patch(self, request: Request, post_id: str) -> Response:
        got = self._get_or_404(post_id)
        if isinstance(got, Response):
            return got
        ser = PostSerializer(got, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)

        # Slug change → uniqueness check
        new_slug = ser.validated_data.get("slug")
        if new_slug and new_slug != got.slug and Post.objects.filter(slug=new_slug).exists():
            return Response(
                {"code": "POST_SLUG_TAKEN", "message": f"Slug '{new_slug}' is already in use."},
                status=status.HTTP_409_CONFLICT,
            )

        was_published = got.status == "published"
        post = ser.save()
        new_status = ser.validated_data.get("status", got.status)
        if not was_published and new_status == "published" and post.published_at is None:
            post.published_at = timezone.now()
            post.save(update_fields=["published_at", "updated_at"])

        return Response(PostSerializer(post).data)

    def delete(self, _request: Request, post_id: str) -> Response:
        got = self._get_or_404(post_id)
        if isinstance(got, Response):
            return got
        got.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminPostStatusView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request: Request, post_id: str) -> Response:
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            return Response(
                {"code": "POST_NOT_FOUND", "message": "Post not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = StatusChangeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)

        was_published = post.status == "published"
        post.status = ser.validated_data["status"]
        if not was_published and post.status == "published" and post.published_at is None:
            post.published_at = timezone.now()
        post.save(update_fields=["status", "published_at", "updated_at"])
        return Response(PostSerializer(post).data)
