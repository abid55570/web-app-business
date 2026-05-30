"""orders Django views — public_router (customer) + admin_router."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from menu.permissions import IsAdminRole

from . import service
from .serializers import (
    OrderCreateRequestSerializer,
    OrderResponseSerializer,
    OrderStatusUpdateSerializer,
)


def _err(exc: service.OrderError) -> Response:
    body = {"code": exc.code, "message": exc.message, **exc.extra}
    return Response(body, status=exc.status_code)


# ─────────── customer-facing ───────────


class CreateOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = OrderCreateRequestSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            order = service.create_order(
                customer_id=str(request.user.pk),
                items=ser.validated_data["items"],
                notes=ser.validated_data.get("notes"),
            )
        except service.OrderError as exc:
            return _err(exc)
        return Response(
            OrderResponseSerializer(order).data, status=status.HTTP_201_CREATED
        )


class ListMyOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        orders = service.list_customer_orders(str(request.user.pk))
        return Response(
            {
                "orders": OrderResponseSerializer(orders, many=True).data,
                "total": len(orders),
            }
        )


class GetMyOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, order_id: str) -> Response:
        try:
            order = service.get_customer_order(order_id, str(request.user.pk))
        except service.OrderError as exc:
            return _err(exc)
        return Response(OrderResponseSerializer(order).data)


class CancelMyOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, order_id: str) -> Response:
        try:
            order = service.cancel_order(order_id, by_customer=str(request.user.pk))
        except service.OrderError as exc:
            return _err(exc)
        return Response(OrderResponseSerializer(order).data)


# ─────────── admin-facing ───────────


class AdminListOrdersView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request: Request) -> Response:
        orders = service.list_all_orders(status=request.query_params.get("status"))
        return Response(
            {
                "orders": OrderResponseSerializer(orders, many=True).data,
                "total": len(orders),
            }
        )


class AdminOrderView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, _request: Request, order_id: str) -> Response:
        try:
            order = service.get_order_admin(order_id)
        except service.OrderError as exc:
            return _err(exc)
        return Response(OrderResponseSerializer(order).data)

    def patch(self, request: Request, order_id: str) -> Response:
        ser = OrderStatusUpdateSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            order = service.update_status(order_id, ser.validated_data["status"])
        except service.OrderError as exc:
            return _err(exc)
        return Response(OrderResponseSerializer(order).data)


class AdminCancelOrderView(APIView):
    permission_classes = [IsAdminRole]

    def post(self, _request: Request, order_id: str) -> Response:
        try:
            order = service.cancel_order(order_id)
        except service.OrderError as exc:
            return _err(exc)
        return Response(OrderResponseSerializer(order).data)
