"""feature-flags business logic — admin CRUD + resolution layer.

Resolution order in `resolve()`:
  1. flag.enabled == False      → False  (kill switch wins everything)
  2. audience in flag.audiences → True   (explicit allow-list)
  3. rolloutPercent > 0 + hash(audience) % 100 < rolloutPercent → True
  4. Default → flag.enabled (which is True at this point)

The hash is SHA1(key + ":" + audience) so the same (key, audience) pair
always lands in the same bucket — reroll-on-restart would be a bad
production surprise.
"""
import hashlib
import json

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.feature_flags.model import FeatureFlag
from app.feature_flags.schemas import FlagCreate, FlagUpdate


class FeatureFlagError(AppError):
    """Raised by the feature-flags service."""


async def list_all(db: AsyncSession) -> list[FeatureFlag]:
    return list((await db.execute(select(FeatureFlag).order_by(FeatureFlag.key))).scalars())


async def get_by_key(db: AsyncSession, key: str) -> FeatureFlag | None:
    return (
        await db.execute(select(FeatureFlag).where(FeatureFlag.key == key))
    ).scalar_one_or_none()


async def get_by_id(db: AsyncSession, flag_id: str) -> FeatureFlag:
    flag = (
        await db.execute(select(FeatureFlag).where(FeatureFlag.id == flag_id))
    ).scalar_one_or_none()
    if flag is None:
        raise FeatureFlagError(
            "FLAG_NOT_FOUND", "Feature flag not found.", status_code=404
        )
    return flag


async def create_flag(db: AsyncSession, body: FlagCreate) -> FeatureFlag:
    existing = await get_by_key(db, body.key)
    if existing is not None:
        raise FeatureFlagError(
            "FLAG_KEY_TAKEN",
            f"Key '{body.key}' is already in use.",
            status_code=409,
        )
    flag = FeatureFlag(
        key=body.key,
        description=body.description,
        enabled=body.enabled,
        rollout_percent=body.rollout_percent,
        audiences=json.dumps(body.audiences),
    )
    db.add(flag)
    await db.commit()
    await db.refresh(flag)
    await bus.emit("feature-flags.created", {"id": flag.id, "key": flag.key})
    return flag


async def update_flag(
    db: AsyncSession, flag_id: str, body: FlagUpdate
) -> FeatureFlag:
    flag = await get_by_id(db, flag_id)
    data = body.model_dump(exclude_unset=True)
    if "audiences" in data and isinstance(data["audiences"], list):
        data["audiences"] = json.dumps(data["audiences"])
    for key, value in data.items():
        setattr(flag, key, value)
    await db.commit()
    await db.refresh(flag)
    await bus.emit(
        "feature-flags.updated",
        {"id": flag.id, "key": flag.key, "enabled": flag.enabled},
    )
    return flag


async def delete_flag(db: AsyncSession, flag_id: str) -> None:
    flag = await get_by_id(db, flag_id)
    key = flag.key
    await db.delete(flag)
    await db.commit()
    await bus.emit("feature-flags.deleted", {"id": flag_id, "key": key})


def _bucket(key: str, audience: str) -> int:
    """Deterministic 0-99 bucket for (flag key, audience). Same input =
    same bucket forever."""
    h = hashlib.sha1(f"{key}:{audience}".encode("utf-8")).hexdigest()
    return int(h[:8], 16) % 100


async def resolve(
    db: AsyncSession, *, key: str, audience: str | None
) -> bool:
    flag = await get_by_key(db, key)
    if flag is None:
        return False
    if not flag.enabled:
        return False
    audiences: list[str] = []
    try:
        audiences = json.loads(flag.audiences or "[]")
    except json.JSONDecodeError:
        audiences = []
    if audience and audience in audiences:
        return True
    if flag.rollout_percent >= 100:
        return True
    if flag.rollout_percent > 0 and audience:
        return _bucket(flag.key, audience) < flag.rollout_percent
    # enabled=True with no rollout + no audience match → on for everyone
    if flag.rollout_percent == 0 and not audiences:
        return True
    return False
