"""FastAPI routes implementing tenants@v1."""
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.database import get_db
from app.tenants.schemas import (
    InviteBody,
    MemberListResponse,
    MemberResponse,
    RoleChange,
    TenantCreate,
    TenantListResponse,
    TenantResponse,
    TenantUpdate,
)
from app.tenants.service import (
    change_role,
    create_tenant,
    get_by_ref,
    invite_member,
    is_member,
    list_members,
    list_my,
    remove_member,
    update_tenant,
)


router = APIRouter()


# ---- tenants ----


@router.get(
    "/tenants/my",
    response_model=TenantListResponse,
    response_model_by_alias=True,
)
async def my_tenants(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> TenantListResponse:
    items = await list_my(db, user.id)
    return TenantListResponse(
        items=[TenantResponse.model_validate(t) for t in items],
        total=len(items),
    )


@router.post(
    "/tenants",
    response_model=TenantResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_tenant_endpoint(
    body: TenantCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> TenantResponse:
    return TenantResponse.model_validate(
        await create_tenant(db, owner_id=user.id, body=body)
    )


@router.get(
    "/tenants/{tenant_ref}",
    response_model=TenantResponse,
    response_model_by_alias=True,
)
async def get_tenant(
    tenant_ref: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> TenantResponse:
    t = await get_by_ref(db, tenant_ref)
    if not await is_member(db, tenant_id=t.id, user_id=user.id):
        from app.tenants.service import TenantError

        raise TenantError(
            "AUTH_FORBIDDEN",
            "Only tenant members can view this tenant.",
            status_code=403,
        )
    return TenantResponse.model_validate(t)


@router.patch(
    "/tenants/{tenant_ref}",
    response_model=TenantResponse,
    response_model_by_alias=True,
)
async def update_tenant_endpoint(
    tenant_ref: str,
    body: TenantUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> TenantResponse:
    return TenantResponse.model_validate(
        await update_tenant(
            db, tenant_ref=tenant_ref, actor_id=user.id, body=body
        )
    )


# ---- members ----


@router.get(
    "/tenants/{tenant_ref}/members",
    response_model=MemberListResponse,
    response_model_by_alias=True,
)
async def list_members_endpoint(
    tenant_ref: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> MemberListResponse:
    items = await list_members(
        db, tenant_ref=tenant_ref, actor_id=user.id
    )
    return MemberListResponse(
        items=[MemberResponse.model_validate(m) for m in items],
        total=len(items),
    )


@router.post(
    "/tenants/{tenant_ref}/members",
    response_model=MemberResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def invite_member_endpoint(
    tenant_ref: str,
    body: InviteBody,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> MemberResponse:
    return MemberResponse.model_validate(
        await invite_member(
            db, tenant_ref=tenant_ref, actor_id=user.id, body=body
        )
    )


@router.patch(
    "/tenants/{tenant_ref}/members/{user_id}",
    response_model=MemberResponse,
    response_model_by_alias=True,
)
async def change_member_role(
    tenant_ref: str,
    user_id: str,
    body: RoleChange,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> MemberResponse:
    return MemberResponse.model_validate(
        await change_role(
            db,
            tenant_ref=tenant_ref,
            actor_id=user.id,
            user_id=user_id,
            new_role=body.role,
        )
    )


@router.delete(
    "/tenants/{tenant_ref}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def remove_member_endpoint(
    tenant_ref: str,
    user_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> None:
    await remove_member(
        db, tenant_ref=tenant_ref, actor_id=user.id, user_id=user_id
    )
