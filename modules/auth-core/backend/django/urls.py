"""auth-core URL config — mounted under /api/auth/ by the root urls.py."""
from django.urls import path

from .views import ChangePasswordView, LogoutView, MeView


app_name = "auth_core"


urlpatterns = [
    path("me", MeView.as_view(), name="me"),
    path("logout", LogoutView.as_view(), name="logout"),
    path("change-password", ChangePasswordView.as_view(), name="change_password"),
]
