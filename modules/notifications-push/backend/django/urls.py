"""notifications-push URLs."""
from django.urls import path

from .views import MySubsView, SendView, SubscribeView, VapidKeyView


app_name = "notifications_push"


urlpatterns = [
    path(
        "notifications/push/vapid-public-key",
        VapidKeyView.as_view(),
        name="vapid_key",
    ),
    path(
        "notifications/push/subscriptions",
        SubscribeView.as_view(),
        name="subscribe",
    ),
    path(
        "notifications/push/subscriptions/my",
        MySubsView.as_view(),
        name="my_subs",
    ),
    path(
        "notifications/push/send",
        SendView.as_view(),
        name="send",
    ),
]
