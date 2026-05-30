"""Pydantic schemas for boards@v1 endpoints."""
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


DEFAULT_COLUMNS = ["todo", "doing", "done"]


def _split_columns(csv: str) -> list[str]:
    return [c.strip() for c in csv.split(",") if c.strip()]


def _join_columns(cols: list[str]) -> str:
    return ",".join(c.strip() for c in cols if c.strip())


class BoardBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str = Field(min_length=1, max_length=255)
    slug: str = Field(min_length=1, max_length=255, pattern=r"^[a-z0-9][a-z0-9-]*$")
    description: str | None = Field(default=None, max_length=2000)
    columns: list[str] = Field(default_factory=lambda: list(DEFAULT_COLUMNS))

    @field_validator("columns")
    @classmethod
    def _non_empty_unique(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("at least one column required")
        if len(v) != len(set(v)):
            raise ValueError("column names must be unique")
        return v


class BoardCreate(BoardBase):
    """`ownerId` resolved from the auth-context, not the body."""


class BoardUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    name: str | None = Field(default=None, min_length=1, max_length=255)
    slug: str | None = Field(
        default=None, min_length=1, max_length=255, pattern=r"^[a-z0-9][a-z0-9-]*$"
    )
    description: str | None = Field(default=None, max_length=2000)
    columns: list[str] | None = None


class BoardResponse(BoardBase):
    """Outbound shape. Splits the stored CSV back into a JSON array."""

    model_config = ConfigDict(from_attributes=False, populate_by_name=True)

    id: str
    owner_id: str = Field(alias="ownerId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    @classmethod
    def from_model(cls, board) -> "BoardResponse":
        return cls(
            id=board.id,
            owner_id=board.owner_id,
            name=board.name,
            slug=board.slug,
            description=board.description,
            columns=_split_columns(board.columns),
            created_at=board.created_at,
            updated_at=board.updated_at,
        )


class BoardListResponse(BaseModel):
    items: list[BoardResponse]
    total: int


# ----- cards -----


class CardBase(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str = Field(min_length=1, max_length=255)
    body: str | None = Field(default=None, max_length=8000)
    status: str = Field(default="todo", min_length=1, max_length=64)
    position: int = Field(default=0, ge=0)
    assignee_id: str | None = Field(default=None, alias="assigneeId")
    due_at: datetime | None = Field(default=None, alias="dueAt")


class CardCreate(CardBase):
    pass


class CardUpdate(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    title: str | None = Field(default=None, min_length=1, max_length=255)
    body: str | None = Field(default=None, max_length=8000)
    assignee_id: str | None = Field(default=None, alias="assigneeId")
    due_at: datetime | None = Field(default=None, alias="dueAt")


class CardMove(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    status: str = Field(min_length=1, max_length=64)
    position: int = Field(ge=0)


class CardResponse(CardBase):
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)

    id: str
    board_id: str = Field(alias="boardId")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")


class CardListResponse(BaseModel):
    items: list[CardResponse]
    total: int


class BoardDetailResponse(BoardResponse):
    """Board + cards in one payload, for the /api/boards/{slug} view."""

    cards: list[CardResponse]

    @classmethod
    def from_board_and_cards(cls, board, cards) -> "BoardDetailResponse":  # type: ignore[override]
        return cls(
            id=board.id,
            owner_id=board.owner_id,
            name=board.name,
            slug=board.slug,
            description=board.description,
            columns=_split_columns(board.columns),
            created_at=board.created_at,
            updated_at=board.updated_at,
            cards=[CardResponse.model_validate(c) for c in cards],
        )
