"""auth-oauth URLs — mounted under /api/auth/."""
from django.urls import path

from .views import OAuthCallbackView


app_name = "auth_oauth"


urlpatterns = [
    path(
        "oauth/<str:provider>/callback",
        OAuthCallbackView.as_view(),
        name="oauth_callback",
    ),
]
