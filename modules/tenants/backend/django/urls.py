"""tenants URLs — single router pattern."""
from django.urls import path

from .views import (
    MembersView,
    MemberItemView,
    MyTenantsView,
    TenantCreateView,
    TenantDetailView,
)


app_name = "tenants"


urlpatterns = [
    path("tenants/my", MyTenantsView.as_view(), name="my"),
    path("tenants", TenantCreateView.as_view(), name="create"),
    path("tenants/<str:tenant_ref>", TenantDetailView.as_view(), name="detail"),
    path(
        "tenants/<str:tenant_ref>/members",
        MembersView.as_view(),
        name="members",
    ),
    path(
        "tenants/<str:tenant_ref>/members/<str:user_id>",
        MemberItemView.as_view(),
        name="member_item",
    ),
]
