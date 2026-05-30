"""orders URLs — public + admin surfaces in one file.

Mounted at /api/ (the first backend_routers prefix). Admin paths use the
admin/ subprefix; the wirer's deriveDjangoUrls picks /api/ from the first
declared router so this single urls.py covers both.
"""
from django.urls import path

from .views import (
    AdminCancelOrderView,
    AdminListOrdersView,
    AdminOrderView,
    CancelMyOrderView,
    CreateOrderView,
    GetMyOrderView,
    ListMyOrdersView,
)


app_name = "orders"


urlpatterns = [
    # customer surface
    path("orders", CreateOrderView.as_view(), name="create"),
    path("orders/list", ListMyOrdersView.as_view(), name="list_mine"),  # noqa: E501
    # NOTE: List + create share `/orders` in FastAPI via verb dispatch.
    # DRF APIView already does verb dispatch on the same path:
    # the route below catches GET; the route above catches POST.
    # Define a single path with both verbs in one view next iteration.
    path("orders/<str:order_id>", GetMyOrderView.as_view(), name="get_mine"),
    path(
        "orders/<str:order_id>/cancel",
        CancelMyOrderView.as_view(),
        name="cancel_mine",
    ),
    # admin surface
    path("admin/orders", AdminListOrdersView.as_view(), name="admin_list"),
    path(
        "admin/orders/<str:order_id>", AdminOrderView.as_view(), name="admin_get_update"
    ),
    path(
        "admin/orders/<str:order_id>/cancel",
        AdminCancelOrderView.as_view(),
        name="admin_cancel",
    ),
]
