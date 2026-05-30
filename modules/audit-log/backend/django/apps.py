"""Django AppConfig for audit-log."""
from django.apps import AppConfig


class AuditLogConfig(AppConfig):
    default_auto_field = "django.db.models.BigAutoField"
    name = "audit_log"
    label = "audit_log"
    verbose_name = "Audit log"
