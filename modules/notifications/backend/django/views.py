"""notifications admin views — read-only NotificationLog viewer."""
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from menu.permissions import IsAdminRole

from .models import NotificationLog
from .serializers import NotificationLogSerializer


class AdminNotificationListView(APIView):
    permission_classes = [IsAdminRole]

    def get(self, request: Request) -> Response:
        qs = NotificationLog.objects.all().order_by("-sent_at")
        channel = request.query_params.get("channel")
        if channel:
            qs = qs.filter(channel=channel)
        event = request.query_params.get("event")
        if event:
            qs = qs.filter(triggered_by_event=event)
        rows = list(qs)
        # Hand-build the envelope rather than feeding pre-serialized dicts
        # back into the outer serializer (it would try to read snake_case
        # source attrs off camelCase keys and emit None for everything).
        return Response(
            {
                "notifications": NotificationLogSerializer(rows, many=True).data,
                "total": len(rows),
            }
        )
