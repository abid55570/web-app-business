"""tags URLs — public + admin surfaces."""
from django.urls import path

from .views import (
    AdminAssignView,
    AdminTagItemView,
    AdminTagListCreateView,
    PublicTagBySlugView,
    PublicTagListView,
    PublicTagsForTargetView,
    PublicTargetsForTagView,
)


app_name = "tags"


urlpatterns = [
    # public
    path("tags", PublicTagListView.as_view(), name="public_list"),
    path("tags/by-slug/<str:slug>", PublicTagBySlugView.as_view(), name="public_by_slug"),
    path(
        "tags/for-target",
        PublicTagsForTargetView.as_view(),
        name="public_for_target",
    ),
    path(
        "tags/<str:tag_id>/targets",
        PublicTargetsForTagView.as_view(),
        name="public_targets",
    ),
    # admin
    path("admin/tags", AdminTagListCreateView.as_view(), name="admin_list_create"),
    path("admin/tags/<str:tag_id>", AdminTagItemView.as_view(), name="admin_item"),
    path("admin/tags/assign", AdminAssignView.as_view(), name="admin_assign"),
]
