"""Reusable DRF permission — admin / owner role gate.

Duplicated from the menu module while auth-core's Django app has not yet
absorbed this. Once it does, this file becomes a re-export.
"""
from rest_framework.permissions import BasePermission


ADMIN_ROLES = {"admin", "owner"}


class IsAdminRole(BasePermission):
    """Authenticated AND role ∈ {admin, owner}. Else 403 AUTH_FORBIDDEN."""

    message = {
        "code": "AUTH_FORBIDDEN",
        "message": "Admin role required for this operation.",
    }

    def has_permission(self, request, view) -> bool:
        u = request.user
        return bool(
            u
            and u.is_authenticated
            and getattr(u, "role", None) in ADMIN_ROLES
        )
