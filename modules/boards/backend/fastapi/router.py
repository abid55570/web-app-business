"""FastAPI routes implementing boards@v1.

Single router (mounted at /api). Every endpoint requires a signed-in user;
ownership is enforced inside the service layer (caller must be the board
owner) so the router stays a thin adapter.

  GET    /boards                     → my boards
  POST   /boards                     → create board
  GET    /boards/{slug_or_id}        → board + cards
  PATCH  /boards/{id}                → update board (slug rename, columns, etc.)
  DELETE /boards/{id}                → delete board (cascades cards)

  POST   /boards/{id}/cards          → create card
  PATCH  /boards/cards/{card_id}     → edit title/body/assignee/due
  PATCH  /boards/cards/{card_id}/move → move (status + position atomically)
  DELETE /boards/cards/{card_id}     → delete card
"""
from typing import Annotated

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.auth_core.dependencies import CurrentUser
from app.database import get_db
from app.boards.schemas import (
    BoardCreate,
    BoardDetailResponse,
    BoardListResponse,
    BoardResponse,
    BoardUpdate,
    CardCreate,
    CardMove,
    CardResponse,
    CardUpdate,
)
from app.boards.service import (
    create_board,
    create_card,
    delete_board,
    delete_card,
    get_board_for_owner,
    list_cards,
    list_my_boards,
    move_card,
    update_board,
    update_card,
)


router = APIRouter()


# ---- boards ----


@router.get("/boards", response_model=BoardListResponse, response_model_by_alias=True)
async def list_boards(
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> BoardListResponse:
    items = await list_my_boards(db, user.id)
    return BoardListResponse(
        items=[BoardResponse.from_model(b) for b in items],
        total=len(items),
    )


@router.post(
    "/boards",
    response_model=BoardResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_board_endpoint(
    body: BoardCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> BoardResponse:
    b = await create_board(db, owner_id=user.id, body=body)
    return BoardResponse.from_model(b)


@router.get(
    "/boards/{board_ref}",
    response_model=BoardDetailResponse,
    response_model_by_alias=True,
)
async def get_board(
    board_ref: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> BoardDetailResponse:
    b = await get_board_for_owner(db, board_id_or_slug=board_ref, owner_id=user.id)
    cards = await list_cards(db, board_id=b.id)
    return BoardDetailResponse.from_board_and_cards(b, cards)


@router.patch(
    "/boards/{board_id}",
    response_model=BoardResponse,
    response_model_by_alias=True,
)
async def update_board_endpoint(
    board_id: str,
    body: BoardUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> BoardResponse:
    b = await update_board(db, board_id=board_id, owner_id=user.id, body=body)
    return BoardResponse.from_model(b)


@router.delete("/boards/{board_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_board_endpoint(
    board_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> None:
    await delete_board(db, board_id=board_id, owner_id=user.id)


# ---- cards ----


@router.post(
    "/boards/{board_id}/cards",
    response_model=CardResponse,
    response_model_by_alias=True,
    status_code=status.HTTP_201_CREATED,
)
async def create_card_endpoint(
    board_id: str,
    body: CardCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> CardResponse:
    c = await create_card(db, board_id=board_id, owner_id=user.id, body=body)
    return CardResponse.model_validate(c)


@router.patch(
    "/boards/cards/{card_id}",
    response_model=CardResponse,
    response_model_by_alias=True,
)
async def update_card_endpoint(
    card_id: str,
    body: CardUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> CardResponse:
    c = await update_card(db, card_id=card_id, owner_id=user.id, body=body)
    return CardResponse.model_validate(c)


@router.patch(
    "/boards/cards/{card_id}/move",
    response_model=CardResponse,
    response_model_by_alias=True,
)
async def move_card_endpoint(
    card_id: str,
    body: CardMove,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> CardResponse:
    c = await move_card(db, card_id=card_id, owner_id=user.id, body=body)
    return CardResponse.model_validate(c)


@router.delete(
    "/boards/cards/{card_id}", status_code=status.HTTP_204_NO_CONTENT
)
async def delete_card_endpoint(
    card_id: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    user: CurrentUser,
) -> None:
    await delete_card(db, card_id=card_id, owner_id=user.id)
