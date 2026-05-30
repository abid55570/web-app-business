"""payment-stripe-subs views — public plan list + admin CRUD + webhook."""
import json
import os
from datetime import datetime, timezone

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Plan, Subscription, SubsWebhookEvent
from .permissions import IsAdminRole
from .serializers import (
    CheckoutBodySerializer,
    PlanSerializer,
    PortalBodySerializer,
    SubscriptionSerializer,
)


def _stripe_fake_checkout(plan_key: str, customer_ref: str) -> tuple[str, str]:
    return (
        f"cs_local_{plan_key}_{customer_ref}",
        f"https://stripe.test/checkout/{plan_key}?ref={customer_ref}",
    )


def _stripe_fake_portal(customer_ref: str, return_url: str) -> str:
    return f"https://stripe.test/portal/{customer_ref}?return_to={return_url}"


class PublicPlansView(APIView):
    permission_classes = [AllowAny]

    def get(self, _request: Request) -> Response:
        items = list(Plan.objects.filter(active=True).order_by("amount_cents"))
        return Response(
            {"items": PlanSerializer(items, many=True).data, "total": len(items)}
        )


class PublicCheckoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = CheckoutBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        try:
            Plan.objects.get(key=ser.validated_data["planKey"], active=True)
        except Plan.DoesNotExist:
            return Response(
                {"code": "PLAN_NOT_FOUND", "message": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        sid, url = _stripe_fake_checkout(
            ser.validated_data["planKey"], ser.validated_data["customerRef"]
        )
        return Response({"sessionId": sid, "checkoutUrl": url})


class PublicPortalView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = PortalBodySerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        return_url = ser.validated_data.get("returnUrl") or os.getenv(
            "STRIPE_PORTAL_RETURN_URL", "https://example.com/billing"
        )
        return Response(
            {
                "portalUrl": _stripe_fake_portal(
                    ser.validated_data["customerRef"], return_url
                )
            }
        )


class PublicActiveSubView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, _request: Request, customer_ref: str) -> Response:
        for sub in Subscription.objects.filter(
            customer_ref=customer_ref
        ).order_by("-created_at"):
            if sub.status != "canceled":
                return Response(SubscriptionSerializer(sub).data)
        return Response(None)


class WebhookView(APIView):
    permission_classes = [AllowAny]
    authentication_classes: list = []

    def post(self, request: Request) -> Response:
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return Response(
                {
                    "code": "STRIPE_WEBHOOK_INVALID",
                    "message": "Body is not valid JSON.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        event_id = payload.get("id")
        event_type = payload.get("type")
        if not event_id or not event_type:
            return Response(
                {
                    "code": "STRIPE_WEBHOOK_INVALID",
                    "message": "Missing event id or type.",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if SubsWebhookEvent.objects.filter(id=event_id).exists():
            return Response({"received": True, "id": event_id, "duplicate": True})
        SubsWebhookEvent.objects.create(
            id=event_id, type=event_type, payload=json.dumps(payload)
        )

        data = payload.get("data", {}).get("object", {})
        if event_type in {
            "customer.subscription.created",
            "customer.subscription.updated",
        }:
            self._upsert(data)
        elif event_type == "customer.subscription.deleted":
            sub = Subscription.objects.filter(
                stripe_subscription_id=data.get("id")
            ).first()
            if sub:
                sub.status = "canceled"
                sub.canceled_at = datetime.now(timezone.utc)
                sub.save(update_fields=["status", "canceled_at", "updated_at"])

        return Response({"received": True, "id": event_id})

    def _upsert(self, data: dict) -> None:
        stripe_id = data.get("id")
        sub = Subscription.objects.filter(stripe_subscription_id=stripe_id).first()
        metadata = data.get("metadata") or {}
        plan_key = (
            metadata.get("plan_key")
            or (data.get("items", {}).get("data") or [{}])[0]
            .get("price", {})
            .get("nickname")
            or "unknown"
        )
        customer_ref = metadata.get("customer_ref") or data.get("customer", "")
        defaults = {
            "customer_ref": customer_ref,
            "plan_key": plan_key,
            "status": data.get("status", "incomplete"),
            "stripe_customer_id": data.get("customer"),
        }
        if sub is None:
            Subscription.objects.create(
                stripe_subscription_id=stripe_id, **defaults
            )
        else:
            for k, v in defaults.items():
                setattr(sub, k, v)
            sub.save()


# ---- admin ----


class AdminPlansView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, _request: Request) -> Response:
        items = list(Plan.objects.all().order_by("amount_cents"))
        return Response(
            {"items": PlanSerializer(items, many=True).data, "total": len(items)}
        )

    def post(self, request: Request) -> Response:
        ser = PlanSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if Plan.objects.filter(key=ser.validated_data["key"]).exists():
            return Response(
                {
                    "code": "PLAN_KEY_TAKEN",
                    "message": f"Plan key '{ser.validated_data['key']}' is already in use.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        plan = ser.save(stripe_price_id=f"price_local_{ser.validated_data['key']}")
        return Response(PlanSerializer(plan).data, status=status.HTTP_201_CREATED)


class AdminPlanItemView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request: Request, plan_id: str) -> Response:
        try:
            plan = Plan.objects.get(pk=plan_id)
        except Plan.DoesNotExist:
            return Response(
                {"code": "PLAN_NOT_FOUND", "message": "Plan not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = PlanSerializer(plan, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        plan = ser.save()
        return Response(PlanSerializer(plan).data)


class AdminSubsView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, _request: Request) -> Response:
        items = list(Subscription.objects.all().order_by("-created_at"))
        return Response(
            {
                "items": SubscriptionSerializer(items, many=True).data,
                "total": len(items),
            }
        )
