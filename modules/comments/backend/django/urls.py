"""comments URLs.

Mounted twice by the wirer's derive-django-urls:
  - public surface at /api/    → /api/comments (GET/POST), /api/comments/<id> (PATCH/DELETE)
  - admin surface at /api/admin/ → /api/admin/comments (GET), .../<id>/status (PATCH), .../<id> (DELETE)
"""
from django.urls import path

from .views import (
    AdminCommentDeleteView,
    AdminCommentListView,
    AdminCommentStatusView,
    PublicCommentListCreateView,
    PublicCommentView,
)


app_name = "comments"


urlpatterns = [
    # public
    path("comments", PublicCommentListCreateView.as_view(), name="public_list_create"),
    path("comments/<str:comment_id>", PublicCommentView.as_view(), name="public_item"),
    # admin
    path("admin/comments", AdminCommentListView.as_view(), name="admin_list"),
    path(
        "admin/comments/<str:comment_id>",
        AdminCommentDeleteView.as_view(),
        name="admin_delete",
    ),
    path(
        "admin/comments/<str:comment_id>/status",
        AdminCommentStatusView.as_view(),
        name="admin_status",
    ),
]
