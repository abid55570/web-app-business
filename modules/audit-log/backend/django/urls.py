"""audit-log URLs — public record + admin read."""
from django.urls import path

from .views import AdminAuditListView, PublicAuditRecordView


app_name = "audit_log"


urlpatterns = [
    path("audit", PublicAuditRecordView.as_view(), name="public_record"),
    path("admin/audit", AdminAuditListView.as_view(), name="admin_list"),
]
