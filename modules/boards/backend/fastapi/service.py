"""boards business logic — owner-only access enforced here.

The router never bypasses these helpers — every read/write goes through a
`_assert_owner` gate so the surface stays small even when more endpoints
are added later.
"""
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.errors import AppError
from app.events_bus.bus import bus
from app.boards.model import Board, BoardCard
from app.boards.schemas import (
    BoardCreate,
    BoardUpdate,
    CardCreate,
    CardMove,
    CardUpdate,
    _join_columns,
)


class BoardError(AppError):
    """Raised by the boards service. Mapped to JSON by middleware."""


MAX_CARDS_PER_BOARD = 500  # mirrors config_knob default


# ---- boards ----


async def list_my_boards(db: AsyncSession, owner_id: str) -> list[Board]:
    stmt = (
        select(Board)
        .where(Board.owner_id == owner_id)
        .order_by(Board.created_at.desc())
    )
    result = await db.execute(stmt)
    return list(result.scalars())


async def get_board_for_owner(
    db: AsyncSession, *, board_id_or_slug: str, owner_id: str
) -> Board:
    stmt = select(Board).where(
        (Board.id == board_id_or_slug) | (Board.slug == board_id_or_slug)
    )
    result = await db.execute(stmt)
    b = result.scalar_one_or_none()
    if b is None:
        raise BoardError("BOARD_NOT_FOUND", "Board not found.", status_code=404)
    if b.owner_id != owner_id:
        raise BoardError(
            "AUTH_FORBIDDEN",
            "Only the board owner can access this board.",
            status_code=403,
        )
    return b


async def create_board(
    db: AsyncSession, *, owner_id: str, body: BoardCreate
) -> Board:
    # Slug uniqueness check up-front for friendly error
    existing = await db.execute(select(Board).where(Board.slug == body.slug))
    if existing.scalar_one_or_none() is not None:
        raise BoardError(
            "BOARD_SLUG_TAKEN",
            f"Slug '{body.slug}' is already in use.",
            status_code=409,
        )

    b = Board(
        owner_id=owner_id,
        name=body.name,
        slug=body.slug,
        description=body.description,
        columns=_join_columns(body.columns),
    )
    db.add(b)
    await db.commit()
    await db.refresh(b)
    await bus.emit(
        "boards.created", {"id": b.id, "ownerId": b.owner_id, "slug": b.slug}
    )
    return b


async def update_board(
    db: AsyncSession, *, board_id: str, owner_id: str, body: BoardUpdate
) -> Board:
    b = await get_board_for_owner(db, board_id_or_slug=board_id, owner_id=owner_id)
    update_data = body.model_dump(exclude_unset=True)

    if "slug" in update_data and update_data["slug"] != b.slug:
        existing = await db.execute(
            select(Board).where(Board.slug == update_data["slug"], Board.id != b.id)
        )
        if existing.scalar_one_or_none() is not None:
            raise BoardError(
                "BOARD_SLUG_TAKEN",
                f"Slug '{update_data['slug']}' is already in use.",
                status_code=409,
            )

    if "columns" in update_data and isinstance(update_data["columns"], list):
        update_data["columns"] = _join_columns(update_data["columns"])

    for key, value in update_data.items():
        setattr(b, key, value)
    await db.commit()
    await db.refresh(b)
    return b


async def delete_board(db: AsyncSession, *, board_id: str, owner_id: str) -> None:
    b = await get_board_for_owner(db, board_id_or_slug=board_id, owner_id=owner_id)
    # Hard delete cards too — board uniqueness is the owner's concern
    await db.execute(
        BoardCard.__table__.delete().where(BoardCard.board_id == b.id)
    )
    await db.delete(b)
    await db.commit()
    await bus.emit("boards.deleted", {"id": b.id})


# ---- cards ----


async def list_cards(db: AsyncSession, *, board_id: str) -> list[BoardCard]:
    stmt = (
        select(BoardCard)
        .where(BoardCard.board_id == board_id)
        .order_by(BoardCard.status, BoardCard.position)
    )
    result = await db.execute(stmt)
    return list(result.scalars())


async def get_card(db: AsyncSession, card_id: str) -> BoardCard:
    result = await db.execute(select(BoardCard).where(BoardCard.id == card_id))
    c = result.scalar_one_or_none()
    if c is None:
        raise BoardError("CARD_NOT_FOUND", "Card not found.", status_code=404)
    return c


async def create_card(
    db: AsyncSession, *, board_id: str, owner_id: str, body: CardCreate
) -> BoardCard:
    b = await get_board_for_owner(db, board_id_or_slug=board_id, owner_id=owner_id)

    # Enforce per-board cap
    count_stmt = select(func.count()).select_from(BoardCard).where(
        BoardCard.board_id == b.id
    )
    total = (await db.execute(count_stmt)).scalar_one()
    if total >= MAX_CARDS_PER_BOARD:
        raise BoardError(
            "CARD_LIMIT_REACHED",
            f"Board has reached its {MAX_CARDS_PER_BOARD}-card limit.",
            status_code=409,
        )

    # Status must be one of the board's columns
    allowed = {c.strip() for c in b.columns.split(",") if c.strip()}
    if body.status not in allowed:
        raise BoardError(
            "CARD_STATUS_INVALID",
            f"status must be one of {sorted(allowed)}",
            status_code=400,
        )

    c = BoardCard(
        board_id=b.id,
        title=body.title,
        body=body.body,
        status=body.status,
        position=body.position,
        assignee_id=body.assignee_id,
        due_at=body.due_at,
    )
    db.add(c)
    await db.commit()
    await db.refresh(c)
    await bus.emit(
        "boards.card.created",
        {"id": c.id, "boardId": c.board_id, "status": c.status},
    )
    return c


async def update_card(
    db: AsyncSession,
    *,
    card_id: str,
    owner_id: str,
    body: CardUpdate,
) -> BoardCard:
    c = await get_card(db, card_id)
    # Owner check via board
    await get_board_for_owner(db, board_id_or_slug=c.board_id, owner_id=owner_id)

    update_data = body.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(c, key, value)
    await db.commit()
    await db.refresh(c)
    return c


async def move_card(
    db: AsyncSession, *, card_id: str, owner_id: str, body: CardMove
) -> BoardCard:
    c = await get_card(db, card_id)
    b = await get_board_for_owner(db, board_id_or_slug=c.board_id, owner_id=owner_id)

    allowed = {col.strip() for col in b.columns.split(",") if col.strip()}
    if body.status not in allowed:
        raise BoardError(
            "CARD_STATUS_INVALID",
            f"status must be one of {sorted(allowed)}",
            status_code=400,
        )

    from_status = c.status
    c.status = body.status
    c.position = body.position
    await db.commit()
    await db.refresh(c)
    await bus.emit(
        "boards.card.moved",
        {
            "id": c.id,
            "boardId": c.board_id,
            "fromStatus": from_status,
            "toStatus": c.status,
        },
    )
    return c


async def delete_card(
    db: AsyncSession, *, card_id: str, owner_id: str
) -> None:
    c = await get_card(db, card_id)
    await get_board_for_owner(db, board_id_or_slug=c.board_id, owner_id=owner_id)
    board_id = c.board_id
    await db.delete(c)
    await db.commit()
    await bus.emit("boards.card.deleted", {"id": card_id, "boardId": board_id})
