"""menu URLs.

Mounted twice by the wirer's derive-django-urls:
  - public surface at /api/    → /api/menu, /api/menu/categories, /api/menu/<id>
  - admin surface at /api/admin/ → /api/admin/menu, /api/admin/menu/<id>, etc.

Both surfaces live in this same file — Django's ``include()`` lets the
prefix differentiate. The wirer reads ``backend_routers`` from module.yaml
to decide which prefixes to mount; a single urls.py covers both with
``path("admin/menu/...")`` vs ``path("menu/...")`` distinctions.
"""
from django.urls import path

from .views import (
    AdminAvailabilityToggleView,
    AdminMenuItemView,
    AdminMenuListCreateView,
    PublicCategoryListView,
    PublicMenuItemView,
    PublicMenuListView,
)


app_name = "menu"


urlpatterns = [
    # public
    path("menu", PublicMenuListView.as_view(), name="public_list"),
    path("menu/categories", PublicCategoryListView.as_view(), name="public_categories"),
    path("menu/<str:item_id>", PublicMenuItemView.as_view(), name="public_item"),
    # admin
    path("admin/menu", AdminMenuListCreateView.as_view(), name="admin_list_create"),
    path("admin/menu/<str:item_id>", AdminMenuItemView.as_view(), name="admin_item"),
    path(
        "admin/menu/<str:item_id>/availability",
        AdminAvailabilityToggleView.as_view(),
        name="admin_availability",
    ),
]
