"""posts URLs.

Mounted twice by the wirer's derive-django-urls:
  - public surface at /api/    → /api/posts, /api/posts/<slug>
  - admin surface at /api/admin/ → /api/admin/posts, /api/admin/posts/<id>, etc.
"""
from django.urls import path

from .views import (
    AdminPostListCreateView,
    AdminPostStatusView,
    AdminPostView,
    PublicPostListView,
    PublicPostView,
)


app_name = "posts"


urlpatterns = [
    # public
    path("posts", PublicPostListView.as_view(), name="public_list"),
    path("posts/<slug:slug>", PublicPostView.as_view(), name="public_detail"),
    # admin
    path("admin/posts", AdminPostListCreateView.as_view(), name="admin_list_create"),
    path("admin/posts/<str:post_id>", AdminPostView.as_view(), name="admin_item"),
    path(
        "admin/posts/<str:post_id>/status",
        AdminPostStatusView.as_view(),
        name="admin_status",
    ),
]
