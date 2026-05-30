"""tenants business logic — owner-only governance, role-aware membership."""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.tenants.model import Tenant, TenantMember
from app.tenants.schemas import InviteBody, TenantCreate, TenantUpdate


class TenantError(AppError):
    """Raised by the tenants service."""


MAX_MEMBERS = 100  # mirrors config_knob default
ADMIN_ROLES = {"owner", "admin"}


async def list_my(db: AsyncSession, user_id: str) -> list[Tenant]:
    sub = select(TenantMember.tenant_id).where(TenantMember.user_id == user_id)
    result = await db.execute(
        select(Tenant)
        .where(Tenant.id.in_(select(sub.subquery())))
        .order_by(Tenant.created_at.desc())
    )
    return list(result.scalars())


async def get_by_ref(db: AsyncSession, ref: str) -> Tenant:
    stmt = select(Tenant).where((Tenant.id == ref) | (Tenant.slug == ref))
    t = (await db.execute(stmt)).scalar_one_or_none()
    if t is None:
        raise TenantError("TENANT_NOT_FOUND", "Tenant not found.", status_code=404)
    return t


async def _require_role(
    db: AsyncSession, *, tenant_id: str, user_id: str, allowed: set[str]
) -> TenantMember:
    stmt = select(TenantMember).where(
        TenantMember.tenant_id == tenant_id, TenantMember.user_id == user_id
    )
    m = (await db.execute(stmt)).scalar_one_or_none()
    if m is None or m.role not in allowed:
        raise TenantError(
            "AUTH_FORBIDDEN",
            f"Operation requires one of: {sorted(allowed)}",
            status_code=403,
        )
    return m


async def is_member(db: AsyncSession, *, tenant_id: str, user_id: str) -> bool:
    stmt = select(TenantMember.id).where(
        TenantMember.tenant_id == tenant_id, TenantMember.user_id == user_id
    )
    return (await db.execute(stmt)).first() is not None


async def create_tenant(
    db: AsyncSession, *, owner_id: str, body: TenantCreate
) -> Tenant:
    existing = await db.execute(select(Tenant).where(Tenant.slug == body.slug))
    if existing.scalar_one_or_none() is not None:
        raise TenantError(
            "TENANT_SLUG_TAKEN",
            f"Slug '{body.slug}' is already in use.",
            status_code=409,
        )

    t = Tenant(owner_id=owner_id, name=body.name, slug=body.slug)
    db.add(t)
    await db.flush()  # need t.id for the owner membership
    db.add(
        TenantMember(
            tenant_id=t.id, user_id=owner_id, role="owner", invited_by=owner_id
        )
    )
    await db.commit()
    await db.refresh(t)
    await bus.emit(
        "tenants.created", {"id": t.id, "ownerId": t.owner_id, "slug": t.slug}
    )
    return t


async def update_tenant(
    db: AsyncSession, *, tenant_ref: str, actor_id: str, body: TenantUpdate
) -> Tenant:
    t = await get_by_ref(db, tenant_ref)
    await _require_role(
        db, tenant_id=t.id, user_id=actor_id, allowed={"owner"}
    )
    update_data = body.model_dump(exclude_unset=True)
    if "slug" in update_data and update_data["slug"] != t.slug:
        existing = await db.execute(
            select(Tenant).where(Tenant.slug == update_data["slug"], Tenant.id != t.id)
        )
        if existing.scalar_one_or_none() is not None:
            raise TenantError(
                "TENANT_SLUG_TAKEN",
                f"Slug '{update_data['slug']}' is already in use.",
                status_code=409,
            )
    for key, value in update_data.items():
        setattr(t, key, value)
    await db.commit()
    await db.refresh(t)
    return t


# ----- members -----


async def list_members(
    db: AsyncSession, *, tenant_ref: str, actor_id: str
) -> list[TenantMember]:
    t = await get_by_ref(db, tenant_ref)
    if not await is_member(db, tenant_id=t.id, user_id=actor_id):
        raise TenantError(
            "AUTH_FORBIDDEN",
            "Only tenant members can list members.",
            status_code=403,
        )
    stmt = (
        select(TenantMember)
        .where(TenantMember.tenant_id == t.id)
        .order_by(TenantMember.joined_at.asc())
    )
    return list((await db.execute(stmt)).scalars())


async def invite_member(
    db: AsyncSession, *, tenant_ref: str, actor_id: str, body: InviteBody
) -> TenantMember:
    t = await get_by_ref(db, tenant_ref)
    await _require_role(
        db, tenant_id=t.id, user_id=actor_id, allowed=ADMIN_ROLES
    )

    # Idempotent — re-inviting the same user returns the existing row
    existing = await db.execute(
        select(TenantMember).where(
            TenantMember.tenant_id == t.id, TenantMember.user_id == body.user_id
        )
    )
    existing_member = existing.scalar_one_or_none()
    if existing_member is not None:
        return existing_member

    # Cap check
    count_stmt = select(TenantMember).where(TenantMember.tenant_id == t.id)
    total = len(list((await db.execute(count_stmt)).scalars()))
    if total >= MAX_MEMBERS:
        raise TenantError(
            "TENANT_MEMBER_LIMIT",
            f"Tenant has reached its {MAX_MEMBERS}-member limit.",
            status_code=409,
        )

    m = TenantMember(
        tenant_id=t.id,
        user_id=body.user_id,
        role=body.role,
        invited_by=actor_id,
    )
    db.add(m)
    await db.commit()
    await db.refresh(m)
    await bus.emit(
        "tenants.member.invited",
        {
            "tenantId": t.id,
            "userId": body.user_id,
            "role": body.role,
            "invitedBy": actor_id,
        },
    )
    return m


async def change_role(
    db: AsyncSession,
    *,
    tenant_ref: str,
    actor_id: str,
    user_id: str,
    new_role: str,
) -> TenantMember:
    t = await get_by_ref(db, tenant_ref)
    await _require_role(
        db, tenant_id=t.id, user_id=actor_id, allowed={"owner"}
    )

    stmt = select(TenantMember).where(
        TenantMember.tenant_id == t.id, TenantMember.user_id == user_id
    )
    m = (await db.execute(stmt)).scalar_one_or_none()
    if m is None:
        raise TenantError(
            "TENANT_MEMBER_NOT_FOUND", "Member not found.", status_code=404
        )
    if m.role == "owner" and new_role != "owner":
        raise TenantError(
            "TENANT_OWNER_DEMOTE",
            "Cannot demote the owner. Transfer ownership first.",
            status_code=409,
        )
    m.role = new_role
    await db.commit()
    await db.refresh(m)
    await bus.emit(
        "tenants.member.role-changed",
        {"tenantId": t.id, "userId": user_id, "role": new_role},
    )
    return m


async def remove_member(
    db: AsyncSession,
    *,
    tenant_ref: str,
    actor_id: str,
    user_id: str,
) -> None:
    t = await get_by_ref(db, tenant_ref)
    # actor can be admin OR the user themselves leaving
    if actor_id != user_id:
        await _require_role(
            db, tenant_id=t.id, user_id=actor_id, allowed=ADMIN_ROLES
        )

    stmt = select(TenantMember).where(
        TenantMember.tenant_id == t.id, TenantMember.user_id == user_id
    )
    m = (await db.execute(stmt)).scalar_one_or_none()
    if m is None:
        return  # idempotent
    if m.role == "owner":
        raise TenantError(
            "TENANT_OWNER_REMOVE",
            "Cannot remove the owner. Transfer ownership first.",
            status_code=409,
        )
    await db.delete(m)
    await db.commit()
    await bus.emit(
        "tenants.member.removed",
        {"tenantId": t.id, "userId": user_id},
    )
