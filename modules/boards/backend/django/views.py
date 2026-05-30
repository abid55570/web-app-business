"""boards views — owner-only access enforced inside views.

Mirrors the FastAPI single-router pattern: one set of /api/boards endpoints,
every one of them gated on `(request.user.id == board.owner_id)`.
"""
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Board, BoardCard
from .serializers import (
    BoardDetailSerializer,
    BoardSerializer,
    CardMoveSerializer,
    CardSerializer,
)


MAX_CARDS_PER_BOARD = 500


def _uid(request: Request) -> str:
    return str(getattr(request.user, "id", ""))


def _allowed_columns(board: Board) -> set[str]:
    return {c.strip() for c in board.columns.split(",") if c.strip()}


def _forbidden() -> Response:
    return Response(
        {"code": "AUTH_FORBIDDEN", "message": "Only the board owner can access this board."},
        status=status.HTTP_403_FORBIDDEN,
    )


def _board_404() -> Response:
    return Response(
        {"code": "BOARD_NOT_FOUND", "message": "Board not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


def _card_404() -> Response:
    return Response(
        {"code": "CARD_NOT_FOUND", "message": "Card not found."},
        status=status.HTTP_404_NOT_FOUND,
    )


# ─────────── boards ───────────


class BoardListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request: Request) -> Response:
        qs = Board.objects.filter(owner_id=_uid(request)).order_by("-created_at")
        items = list(qs)
        return Response(
            {"items": BoardSerializer(items, many=True).data, "total": len(items)}
        )

    def post(self, request: Request) -> Response:
        ser = BoardSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        slug = ser.validated_data["slug"]
        if Board.objects.filter(slug=slug).exists():
            return Response(
                {"code": "BOARD_SLUG_TAKEN", "message": f"Slug '{slug}' is already in use."},
                status=status.HTTP_409_CONFLICT,
            )
        board = Board.objects.create(
            owner_id=_uid(request),
            name=ser.validated_data["name"],
            slug=slug,
            description=ser.validated_data.get("description"),
            columns=ser.validated_data.get("columns", "todo,doing,done"),
        )
        return Response(BoardSerializer(board).data, status=status.HTTP_201_CREATED)


class BoardDetailView(APIView):
    """GET (with cards) / PATCH / DELETE — owner only."""

    permission_classes = [IsAuthenticated]

    def _lookup(self, ref: str) -> Board | None:
        return (
            Board.objects.filter(id=ref).first()
            or Board.objects.filter(slug=ref).first()
        )

    def get(self, request: Request, board_ref: str) -> Response:
        board = self._lookup(board_ref)
        if not board:
            return _board_404()
        if board.owner_id != _uid(request):
            return _forbidden()
        cards = list(
            BoardCard.objects.filter(board_id=board.id).order_by("status", "position")
        )
        data = BoardSerializer(board).data
        data["cards"] = CardSerializer(cards, many=True).data
        return Response(data)

    def patch(self, request: Request, board_ref: str) -> Response:
        board = self._lookup(board_ref)
        if not board:
            return _board_404()
        if board.owner_id != _uid(request):
            return _forbidden()
        ser = BoardSerializer(board, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        new_slug = ser.validated_data.get("slug")
        if (
            new_slug
            and new_slug != board.slug
            and Board.objects.filter(slug=new_slug).exclude(id=board.id).exists()
        ):
            return Response(
                {"code": "BOARD_SLUG_TAKEN", "message": f"Slug '{new_slug}' is already in use."},
                status=status.HTTP_409_CONFLICT,
            )
        board = ser.save()
        return Response(BoardSerializer(board).data)

    def delete(self, request: Request, board_ref: str) -> Response:
        board = self._lookup(board_ref)
        if not board:
            return _board_404()
        if board.owner_id != _uid(request):
            return _forbidden()
        BoardCard.objects.filter(board_id=board.id).delete()
        board.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ─────────── cards ───────────


class CardCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request: Request, board_id: str) -> Response:
        try:
            board = Board.objects.get(pk=board_id)
        except Board.DoesNotExist:
            return _board_404()
        if board.owner_id != _uid(request):
            return _forbidden()
        if BoardCard.objects.filter(board_id=board.id).count() >= MAX_CARDS_PER_BOARD:
            return Response(
                {
                    "code": "CARD_LIMIT_REACHED",
                    "message": f"Board has reached its {MAX_CARDS_PER_BOARD}-card limit.",
                },
                status=status.HTTP_409_CONFLICT,
            )
        ser = CardSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if ser.validated_data["status"] not in _allowed_columns(board):
            return Response(
                {
                    "code": "CARD_STATUS_INVALID",
                    "message": f"status must be one of {sorted(_allowed_columns(board))}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        card = BoardCard.objects.create(
            board_id=board.id,
            title=ser.validated_data["title"],
            body=ser.validated_data.get("body"),
            status=ser.validated_data["status"],
            position=ser.validated_data.get("position", 0),
            assignee_id=ser.validated_data.get("assignee_id"),
            due_at=ser.validated_data.get("due_at"),
        )
        return Response(CardSerializer(card).data, status=status.HTTP_201_CREATED)


class CardItemView(APIView):
    """PATCH (edit) / DELETE — owner of the parent board only."""

    permission_classes = [IsAuthenticated]

    def _get_card_and_board(self, card_id: str):
        try:
            card = BoardCard.objects.get(pk=card_id)
        except BoardCard.DoesNotExist:
            return None, None
        try:
            board = Board.objects.get(pk=card.board_id)
        except Board.DoesNotExist:
            return card, None
        return card, board

    def patch(self, request: Request, card_id: str) -> Response:
        card, board = self._get_card_and_board(card_id)
        if not card:
            return _card_404()
        if not board:
            return _board_404()
        if board.owner_id != _uid(request):
            return _forbidden()
        ser = CardSerializer(card, data=request.data, partial=True)
        ser.is_valid(raise_exception=True)
        card = ser.save()
        return Response(CardSerializer(card).data)

    def delete(self, request: Request, card_id: str) -> Response:
        card, board = self._get_card_and_board(card_id)
        if not card:
            return _card_404()
        if board and board.owner_id != _uid(request):
            return _forbidden()
        card.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CardMoveView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request: Request, card_id: str) -> Response:
        try:
            card = BoardCard.objects.get(pk=card_id)
        except BoardCard.DoesNotExist:
            return _card_404()
        try:
            board = Board.objects.get(pk=card.board_id)
        except Board.DoesNotExist:
            return _board_404()
        if board.owner_id != _uid(request):
            return _forbidden()
        ser = CardMoveSerializer(data=request.data)
        ser.is_valid(raise_exception=True)
        if ser.validated_data["status"] not in _allowed_columns(board):
            return Response(
                {
                    "code": "CARD_STATUS_INVALID",
                    "message": f"status must be one of {sorted(_allowed_columns(board))}",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        card.status = ser.validated_data["status"]
        card.position = ser.validated_data["position"]
        card.save(update_fields=["status", "position", "updated_at"])
        return Response(CardSerializer(card).data)
