"""notifications-whatsapp URLs — verify (GET) + status (POST) webhook."""
from django.urls import path

from .webhooks import WhatsappWebhookView


app_name = "notifications_whatsapp"


urlpatterns = [
    path("whatsapp", WhatsappWebhookView.as_view(), name="webhook"),
]
