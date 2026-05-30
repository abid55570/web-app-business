"""tags views — public read + lookups, admin CRUD + assign/unassign."""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tag, TagAssignment
from .permissions import IsAdminRole
from .serializers import AssignBodySerializer, TagSerializer


MAX_TAGS_PER_TARGET = 16


def _tag_404() -> Response:
    return Response(
        {"code": "TAG_NOT_FOUND", "message": "Tag not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


# ─────────── public ───────────


class PublicTagListView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request) -> Response:
        items = list(Tag.objects.all().order_by("slug"))
        return Response(
            {"items": TagSerializer(items, many=True).data, "total": len(items)}
        )


class PublicTagBySlugView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request, slug: str) -> Response:
        try:
            tag = Tag.objects.get(slug=slug)
        except Tag.DoesNotExist:
            return _tag_404()
        return Response(TagSerializer(tag).data)


class PublicTagsForTargetView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        target_type = request.query_params.get("targetType")
        target_id = request.query_params.get("targetId")
        if not target_type or not target_id:
            return Response(
                {
                    "code": "TAG_TARGET_REQUIRED",
                    "message": "targetType and targetId query params are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        ids = TagAssignment.objects.filter(
            target_type=target_type, target_id=target_id
        ).values_list("tag_id", flat=True)
        tags = list(Tag.objects.filter(id__in=list(ids)).order_by("slug"))
        return Response(
            {
                "targetType": target_type,
                "targetId": target_id,
                "tags": TagSerializer(tags, many=True).data,
            }
        )


class PublicTargetsForTagView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, tag_id: str) -> Response:
        try:
            tag = Tag.objects.get(pk=tag_id)
        except Tag.DoesNotExist:
            return _tag_404()
        qs = TagAssignment.objects.filter(tag_id=tag_id).order_by("-created_at")
        target_type = request.query_params.get("targetType")
        if target_type:
            qs = qs.filter(target_type=target_type)
        targets = [
            {"targetType": a.target_type, "targetId": a.target_id} for a in qs
        ]
        return Response({"tag": TagSerializer(tag).data, "targets": targets})


# ─────────── admin ───────────


class AdminTagListCreateView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, _request: Request) -> Response:
        items = list(Tag.objects.all().order_by("slug"))
        return Response(
            {"items": TagSerializer(items, many=True).data, "total": len(items)}
        )

    def post(self, request: Request) -> Response:
        ser = TagSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if Tag.objects.filter(slug=ser.validated_data["slug"]).exists():
            return Response(
                {
                    "code": "TAG_SLUG_TAKEN",
                    "message": f"Slug '{ser.validated_data['slug']}' is already in use.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        tag = ser.save()
        return Response(TagSerializer(tag).data, status=status.HTTP_201_CREATED)


class AdminTagItemView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request: Request, tag_id: str) -> Response:
        try:
            tag = Tag.objects.get(pk=tag_id)
        except Tag.DoesNotExist:
            return _tag_404()
        ser = TagSerializer(tag, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        new_slug = ser.validated_data.get("slug")
        if (
            new_slug
            and new_slug != tag.slug
            and Tag.objects.filter(slug=new_slug).exclude(id=tag.id).exists()
        ):
            return Response(
                {
                    "code": "TAG_SLUG_TAKEN",
                    "message": f"Slug '{new_slug}' is already in use.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        tag = ser.save()
        return Response(TagSerializer(tag).data)

    def delete(self, _request: Request, tag_id: str) -> Response:
        try:
            tag = Tag.objects.get(pk=tag_id)
        except Tag.DoesNotExist:
            return _tag_404()
        TagAssignment.objects.filter(tag_id=tag.id).delete()
        tag.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminAssignView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request: Request) -> Response:
        ser = AssignBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        tag_id = ser.validated_data["tagId"]
        target_type = ser.validated_data["targetType"]
        target_id = ser.validated_data["targetId"]
        if not Tag.objects.filter(pk=tag_id).exists():
            return _tag_404()

        existing = TagAssignment.objects.filter(
            target_type=target_type, target_id=target_id
        )
        if existing.filter(tag_id=tag_id).exists():
            pass  # idempotent
        elif existing.count() >= MAX_TAGS_PER_TARGET:
            return Response(
                {
                    "code": "TAG_LIMIT_REACHED",
                    "message": f"Target already carries {MAX_TAGS_PER_TARGET} tags.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        else:
            TagAssignment.objects.create(
                tag_id=tag_id, target_type=target_type, target_id=target_id
            )

        ids = TagAssignment.objects.filter(
            target_type=target_type, target_id=target_id
        ).values_list("tag_id", flat=True)
        tags = list(Tag.objects.filter(id__in=list(ids)).order_by("slug"))
        return Response(
            {
                "targetType": target_type,
                "targetId": target_id,
                "tags": TagSerializer(tags, many=True).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request: Request) -> Response:
        tag_id = request.query_params.get("tagId")
        target_type = request.query_params.get("targetType")
        target_id = request.query_params.get("targetId")
        if not (tag_id and target_type and target_id):
            return Response(
                {
                    "code": "TAG_ASSIGN_PARAMS_REQUIRED",
                    "message": "tagId, targetType, targetId query params are required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        TagAssignment.objects.filter(
            tag_id=tag_id, target_type=target_type, target_id=target_id
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
