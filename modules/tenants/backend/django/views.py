"""tenants views — role-gated CRUD + membership management."""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tenant, TenantMember
from .serializers import MemberSerializer, RoleChangeSerializer, TenantSerializer


MAX_MEMBERS = 100
ADMIN_ROLES = {"owner", "admin"}


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _lookup(ref: str) -> Tenant | None:
    return Tenant.objects.filter(id=ref).first() or Tenant.objects.filter(slug=ref).first()


def _role(tenant_id: str, user_id: str) -> str | None:
    m = TenantMember.objects.filter(tenant_id=tenant_id, user_id=user_id).first()
    return m.role if m else None


def _forbidden() -> Response:
    return Response(
        {"code": "AUTH_FORBIDDEN", "message": "Insufficient role for this operation."},
        status=status.HTTP_403_FORBIDDEN,
    )


def _not_found() -> Response:
    return Response(
        {"code": "TENANT_NOT_FOUND", "message": "Tenant not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


class MyTenantsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        ids = list(
            TenantMember.objects.filter(user_id=_uid(request)).values_list(
                "tenant_id", flat=True
            )
        )
        items = list(Tenant.objects.filter(id__in=ids).order_by("-created_at"))
        return Response(
            {"items": TenantSerializer(items, many=True).data, "total": len(items)}
        )


class TenantCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request) -> Response:
        ser = TenantSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if Tenant.objects.filter(slug=ser.validated_data["slug"]).exists():
            return Response(
                {
                    "code": "TENANT_SLUG_TAKEN",
                    "message": f"Slug '{ser.validated_data['slug']}' is already in use.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        t = Tenant.objects.create(owner_id=_uid(request), **ser.validated_data)
        TenantMember.objects.create(
            tenant_id=t.id,
            user_id=_uid(request),
            role="owner",
            invited_by=_uid(request),
        )
        return Response(TenantSerializer(t).data, status=status.HTTP_201_CREATED)


class TenantDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, tenant_ref: str) -> Response:
        t = _lookup(tenant_ref)
        if not t:
            return _not_found()
        if _role(t.id, _uid(request)) is None:
            return _forbidden()
        return Response(TenantSerializer(t).data)

    def patch(self, request: Request, tenant_ref: str) -> Response:
        t = _lookup(tenant_ref)
        if not t:
            return _not_found()
        if _role(t.id, _uid(request)) != "owner":
            return _forbidden()
        ser = TenantSerializer(t, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        new_slug = ser.validated_data.get("slug")
        if (
            new_slug
            and new_slug != t.slug
            and Tenant.objects.filter(slug=new_slug).exclude(id=t.id).exists()
        ):
            return Response(
                {
                    "code": "TENANT_SLUG_TAKEN",
                    "message": f"Slug '{new_slug}' is already in use.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        t = ser.save()
        return Response(TenantSerializer(t).data)


class MembersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request, tenant_ref: str) -> Response:
        t = _lookup(tenant_ref)
        if not t:
            return _not_found()
        if _role(t.id, _uid(request)) is None:
            return _forbidden()
        items = list(
            TenantMember.objects.filter(tenant_id=t.id).order_by("joined_at")
        )
        return Response(
            {"items": MemberSerializer(items, many=True).data, "total": len(items)}
        )

    def post(self, request: Request, tenant_ref: str) -> Response:
        t = _lookup(tenant_ref)
        if not t:
            return _not_found()
        if _role(t.id, _uid(request)) not in ADMIN_ROLES:
            return _forbidden()
        ser = MemberSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        existing = TenantMember.objects.filter(
            tenant_id=t.id, user_id=ser.validated_data["user_id"]
        ).first()
        if existing:
            return Response(MemberSerializer(existing).data, status=status.HTTP_201_CREATED)
        if TenantMember.objects.filter(tenant_id=t.id).count() >= MAX_MEMBERS:
            return Response(
                {
                    "code": "TENANT_MEMBER_LIMIT",
                    "message": f"Tenant has reached its {MAX_MEMBERS}-member limit.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        m = TenantMember.objects.create(
            tenant_id=t.id,
            user_id=ser.validated_data["user_id"],
            role=ser.validated_data.get("role", "member"),
            invited_by=_uid(request),
        )
        return Response(MemberSerializer(m).data, status=status.HTTP_201_CREATED)


class MemberItemView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, tenant_ref: str, user_id: str) -> Response:
        t = _lookup(tenant_ref)
        if not t:
            return _not_found()
        if _role(t.id, _uid(request)) != "owner":
            return _forbidden()
        m = TenantMember.objects.filter(tenant_id=t.id, user_id=user_id).first()
        if not m:
            return Response(
                {"code": "TENANT_MEMBER_NOT_FOUND", "message": "Member not found."},
                status=status.HTTP_404_NOT_FOUND,
            )
        ser = RoleChangeSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        new_role = ser.validated_data["role"]
        if m.role == "owner" and new_role != "owner":
            return Response(
                {
                    "code": "TENANT_OWNER_DEMOTE",
                    "message": "Cannot demote the owner. Transfer ownership first.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        m.role = new_role
        m.save(update_fields=["role"])
        return Response(MemberSerializer(m).data)

    def delete(self, request: Request, tenant_ref: str, user_id: str) -> Response:
        t = _lookup(tenant_ref)
        if not t:
            return _not_found()
        actor = _uid(request)
        # actor can be admin OR the user themselves leaving
        if actor != user_id and _role(t.id, actor) not in ADMIN_ROLES:
            return _forbidden()
        m = TenantMember.objects.filter(tenant_id=t.id, user_id=user_id).first()
        if not m:
            return Response(status=status.HTTP_204_NO_CONTENT)
        if m.role == "owner":
            return Response(
                {
                    "code": "TENANT_OWNER_REMOVE",
                    "message": "Cannot remove the owner. Transfer ownership first.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        m.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
