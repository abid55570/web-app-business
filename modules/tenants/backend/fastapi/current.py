"""Current-tenant resolution helper.

Reads `X-Tenant: <slug>` from the request and resolves it to a Tenant row.
Modules that opt into tenant-scoping import this helper from their routers:

    from app.tenants.current import get_current_tenant
    tenant: CurrentTenant  # in a route signature

v2 will ship a middleware that wraps DB queries with tenant filters
automatically. For now opt-in per query.
"""
from typing import Annotated

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.database import get_db
from app.tenants.model import Tenant, TenantMember


async def get_current_tenant(
    x_tenant: Annotated[str | None, Header(alias="X-Tenant")] = None,
    db: Annotated[AsyncSession, Depends(get_db)] = None,  # type: ignore[assignment]
    user: CurrentUser = None,  # type: ignore[assignment]
) -> Tenant:
    if not x_tenant:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail={
                "code": "TENANT_HEADER_MISSING",
                "message": "X-Tenant header required for this endpoint.",
            },
        )
    result = await db.execute(select(Tenant).where(Tenant.slug == x_tenant))
    tenant = result.scalar_one_or_none()
    if tenant is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "code": "TENANT_NOT_FOUND",
                "message": "Tenant not found for header.",
            },
        )
    membership = await db.execute(
        select(TenantMember.id).where(
            TenantMember.tenant_id == tenant.id, TenantMember.user_id == user.id
        )
    )
    if membership.first() is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "code": "AUTH_FORBIDDEN",
                "message": "Not a member of the requested tenant.",
            },
        )
    return tenant


CurrentTenant = Annotated[Tenant, Depends(get_current_tenant)]
