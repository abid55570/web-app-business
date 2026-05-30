"""notifications-twilio URLs — status webhook."""
from django.urls import path

from .webhooks import TwilioStatusView


app_name = "notifications_twilio"


urlpatterns = [
    path("twilio/status", TwilioStatusView.as_view(), name="status_webhook"),
]
