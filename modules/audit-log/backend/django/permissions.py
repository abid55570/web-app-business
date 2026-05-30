"""Reusable DRF permission — admin / owner role gate."""
from rest_framework.permissions import BasePermission

ADMIN_ROLES = {"admin", "owner"}


class IsAdminRole(BasePermission):
    message = {
        "code": "AUTH_FORBIDDEN",
        "message": "Admin role required for this operation.",
    }

    def has_permission(self, request, view) -> bool:
        u = request.user
        return bool(
            u and u.is_authenticated and getattr(u, "role", None) in ADMIN_ROLES
        )
