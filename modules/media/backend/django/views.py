"""media views — public read, auth+owner write."""
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Media
from .serializers import MediaSerializer


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _forbidden() -> Response:
    return Response(
        {
            "code": "AUTH_FORBIDDEN",
            "message": "Only the asset owner can edit or delete this media.",
        },
        status=status.HTTP_403_FORBIDDEN,
    )


def _not_found() -> Response:
    return Response(
        {"code": "MEDIA_NOT_FOUND", "message": "Media not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


class PublicMediaListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        qs = Media.objects.all().order_by("-created_at")
        if owner := request.query_params.get("ownerId"):
            qs = qs.filter(owner_id=owner)
        if kind := request.query_params.get("kind"):
            qs = qs.filter(kind=kind)
        items = list(qs)
        return Response(
            {"items": MediaSerializer(items, many=True).data, "total": len(items)}
        )


class MyMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        qs = Media.objects.filter(owner_id=_uid(request)).order_by("-created_at")
        items = list(qs)
        return Response(
            {"items": MediaSerializer(items, many=True).data, "total": len(items)}
        )


class MediaItemView(APIView):
    """GET (public) / PATCH (owner) / DELETE (owner)."""

    def get_permissions(self):
        if self.request.method in {"PATCH", "DELETE"}:
            return [IsAuthenticated()]
        return [AllowAny()]

    def _get(self, media_id: str) -> Media | Response:
        try:
            return Media.objects.get(pk=media_id)
        except Media.DoesNotExist:
            return _not_found()

    def get(self, _request: Request, media_id: str) -> Response:
        got = self._get(media_id)
        if isinstance(got, Response):
            return got
        return Response(MediaSerializer(got).data)

    def patch(self, request: Request, media_id: str) -> Response:
        got = self._get(media_id)
        if isinstance(got, Response):
            return got
        if got.owner_id != _uid(request):
            return _forbidden()
        ser = MediaSerializer(got, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        got = ser.save()
        return Response(MediaSerializer(got).data)

    def delete(self, request: Request, media_id: str) -> Response:
        got = self._get(media_id)
        if isinstance(got, Response):
            return got
        if got.owner_id != _uid(request):
            return _forbidden()
        got.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RegisterMediaView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = MediaSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        m = Media.objects.create(owner_id=_uid(request), **ser.validated_data)
        return Response(MediaSerializer(m).data, status=status.HTTP_201_CREATED)
