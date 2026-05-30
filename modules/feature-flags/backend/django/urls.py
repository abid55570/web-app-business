"""feature-flags URLs — public check + admin CRUD."""
from django.urls import path

from .views import (
    AdminItemView,
    AdminListCreateView,
    PublicCheckView,
    PublicListView,
)


app_name = "feature_flags"


urlpatterns = [
    path("feature-flags", PublicListView.as_view(), name="public_list"),
    path("feature-flags/check/<str:key>", PublicCheckView.as_view(), name="public_check"),
    path("admin/feature-flags", AdminListCreateView.as_view(), name="admin_list_create"),
    path("admin/feature-flags/<str:flag_id>", AdminItemView.as_view(), name="admin_item"),
]
