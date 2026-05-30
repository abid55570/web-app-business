"""flags URLs — public open + admin queue/resolve."""
from django.urls import path

from .views import (
    AdminFlagForTargetView,
    AdminFlagListView,
    AdminFlagResolveView,
    PublicFlagOpenView,
)


app_name = "flags"


urlpatterns = [
    path("flags", PublicFlagOpenView.as_view(), name="public_open"),
    path("admin/flags", AdminFlagListView.as_view(), name="admin_list"),
    path("admin/flags/for-target", AdminFlagForTargetView.as_view(), name="admin_for_target"),
    path("admin/flags/<str:flag_id>", AdminFlagResolveView.as_view(), name="admin_resolve"),
]
