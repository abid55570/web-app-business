"""notifications URLs — admin surface only.

The wirer mounts this urls.py under the prefix declared by the first
``backend_routers`` entry in module.yaml (``/api/admin/`` for this module),
so paths here are relative to that.
"""
from django.urls import path

from .views import AdminNotificationListView


app_name = "notifications"


urlpatterns = [
    path("notifications", AdminNotificationListView.as_view(), name="admin_list"),
]
