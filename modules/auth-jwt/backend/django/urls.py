"""auth-jwt URLs — mounted under /api/auth/ alongside auth-core's URLs."""
from django.urls import path

from .views import LoginView, SignupView


app_name = "auth_jwt"


urlpatterns = [
    path("signup", SignupView.as_view(), name="signup"),
    path("login", LoginView.as_view(), name="login"),
]
