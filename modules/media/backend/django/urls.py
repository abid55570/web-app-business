"""media URLs."""
from django.urls import path

from .views import (
    MediaItemView,
    MyMediaView,
    PublicMediaListView,
    RegisterMediaView,
)


app_name = "media"


urlpatterns = [
    path("media", PublicMediaListView.as_view(), name="public_list"),
    path("media/my", MyMediaView.as_view(), name="my"),
    path("media", RegisterMediaView.as_view(), name="register"),
    path("media/<str:media_id>", MediaItemView.as_view(), name="item"),
]
