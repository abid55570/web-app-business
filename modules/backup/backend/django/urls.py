"""backup URLs — admin-only."""
from django.urls import path

from .views import (
    AdminBackupListView,
    AdminBackupPurgeView,
    AdminBackupTriggerView,
)


app_name = "backup"


urlpatterns = [
    path("admin/backup", AdminBackupListView.as_view(), name="admin_list"),
    path(
        "admin/backup/trigger",
        AdminBackupTriggerView.as_view(),
        name="admin_trigger",
    ),
    path(
        "admin/backup/purge",
        AdminBackupPurgeView.as_view(),
        name="admin_purge",
    ),
]
