"""Menu views — public list/get + admin CRUD.

Mirrors the FastAPI dual-router shape: GET /api/menu and /api/menu/{id} are
public + filter to is_available=true; the /api/admin/menu/* endpoints
require role ∈ {admin, owner}.
"""
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import MenuItem
from .permissions import IsAdminRole
from .serializers import AvailabilityToggleSerializer, MenuItemSerializer


# ─────────── public ───────────


class PublicMenuListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request) -> Response:
        qs = MenuItem.objects.filter(is_available=True).order_by(
            "category", "sort_order", "name"
        )
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        items = list(qs)
        return Response(
            {
                "items": MenuItemSerializer(items, many=True).data,
                "total": len(items),
            }
        )


class PublicMenuItemView(APIView):
    permission_classes = [AllowAny]

    def get(self, request: Request, item_id: str) -> Response:
        try:
            item = MenuItem.objects.get(pk=item_id, is_available=True)
        except MenuItem.DoesNotExist:
            return Response(
                {"code": "MENU_ITEM_NOT_FOUND", "message": "Menu item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        return Response(MenuItemSerializer(item).data)


class PublicCategoryListView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request) -> Response:
        cats = sorted(
            MenuItem.objects.filter(is_available=True)
            .values_list("category", flat=True)
            .distinct()
        )
        return Response({"categories": cats})


# ─────────── admin ───────────


class AdminMenuListCreateView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = MenuItem.objects.all().order_by("category", "sort_order", "name")
        category = request.query_params.get("category")
        if category:
            qs = qs.filter(category=category)
        items = list(qs)
        return Response(
            {
                "items": MenuItemSerializer(items, many=True).data,
                "total": len(items),
            }
        )

    def post(self, request: Request) -> Response:
        ser = MenuItemSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        item = ser.save()
        return Response(
            MenuItemSerializer(item).data, status=status.HTTP_201_CREATED
        )


class AdminMenuItemView(APIView):
    permission_classes = [IsAdminRole]

    def _get_or_404(self, item_id: str) -> MenuItem | Response:
        try:
            return MenuItem.objects.get(pk=item_id)
        except MenuItem.DoesNotExist:
            return Response(
                {"code": "MENU_ITEM_NOT_FOUND", "message": "Menu item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

    def get(self, _request: Request, item_id: str) -> Response:
        got = self._get_or_404(item_id)
        if isinstance(got, Response):
            return got
        return Response(MenuItemSerializer(got).data)

    def patch(self, request: Request, item_id: str) -> Response:
        got = self._get_or_404(item_id)
        if isinstance(got, Response):
            return got
        ser = MenuItemSerializer(got, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        item = ser.save()
        return Response(MenuItemSerializer(item).data)

    def delete(self, _request: Request, item_id: str) -> Response:
        got = self._get_or_404(item_id)
        if isinstance(got, Response):
            return got
        got.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class AdminAvailabilityToggleView(APIView):
    permission_classes = [IsAdminRole]

    def patch(self, request: Request, item_id: str) -> Response:
        try:
            item = MenuItem.objects.get(pk=item_id)
        except MenuItem.DoesNotExist:
            return Response(
                {"code": "MENU_ITEM_NOT_FOUND", "message": "Menu item not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = AvailabilityToggleSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        item.is_available = ser.validated_data["isAvailable"]
        item.save(update_fields=["is_available", "updated_at"])
        return Response(MenuItemSerializer(item).data)
