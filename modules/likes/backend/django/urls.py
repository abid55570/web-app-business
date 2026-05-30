"""likes URLs — single router pattern."""
from django.urls import path

from .views import ForTargetView, MyLikesView, ToggleLikeView


app_name = "likes"


urlpatterns = [
    path("likes", ToggleLikeView.as_view(), name="toggle"),
    path("likes/for-target", ForTargetView.as_view(), name="for_target"),
    path("likes/my", MyLikesView.as_view(), name="my"),
]
