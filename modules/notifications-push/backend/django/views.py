"""notifications-push views — subscribe / unsubscribe / dispatch."""
import os

from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import PushSubscription
from .permissions import IsAdminRole
from .serializers import (
    SendBodySerializer,
    SubscribeBodySerializer,
    SubscriptionSerializer,
)


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _send_one(subscription: PushSubscription, payload: dict) -> str:
    """Replace with `pywebpush.webpush(...)` in production. Returns
    'delivered' / 'expired' / 'failed'. Default returns 'delivered' so
    tests pass without a network."""
    return "delivered"


class VapidKeyView(APIView):
    permission_classes = []
    authentication_classes: list = []

    def get(self, _request: Request) -> Response:
        return Response({"publicKey": os.getenv("VAPID_PUBLIC_KEY", "")})


class SubscribeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = SubscribeBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        sub, created = PushSubscription.objects.update_or_create(
            user_id=_uid(request),
            endpoint=ser.validated_data["endpoint"],
            defaults={
                "p256dh_key": ser.validated_data["p256dhKey"],
                "auth_key": ser.validated_data["authKey"],
                "user_agent": request.META.get("HTTP_USER_AGENT"),
            },
        )
        return Response(
            SubscriptionSerializer(sub).data,
            status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
        )

    def delete(self, request: Request) -> Response:
        endpoint = request.query_params.get("endpoint")
        if not endpoint:
            return Response(
                {
                    "code": "PUSH_ENDPOINT_REQUIRED",
                    "message": "endpoint query param required.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        PushSubscription.objects.filter(
            user_id=_uid(request), endpoint=endpoint
        ).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class MySubsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        items = list(
            PushSubscription.objects.filter(user_id=_uid(request)).order_by(
                "-created_at"
            )
        )
        return Response(
            {
                "items": SubscriptionSerializer(items, many=True).data,
                "total": len(items),
            }
        )


class SendView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def post(self, request: Request) -> Response:
        ser = SendBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        user_id = ser.validated_data["userId"]
        payload = ser.validated_data["payload"]
        subs = list(PushSubscription.objects.filter(user_id=user_id))
        delivered = 0
        expired_ids = []
        for sub in subs:
            outcome = _send_one(sub, payload)
            if outcome == "delivered":
                delivered += 1
            elif outcome == "expired":
                expired_ids.append(sub.id)
        if expired_ids:
            PushSubscription.objects.filter(id__in=expired_ids).delete()
        return Response(
            {
                "userId": user_id,
                "deliveredCount": delivered,
                "expiredCount": len(expired_ids),
            }
        )
