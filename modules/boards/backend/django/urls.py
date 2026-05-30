"""boards URLs — single router pattern (no admin/public split)."""
from django.urls import path

from .views import (
    BoardDetailView,
    BoardListCreateView,
    CardCreateView,
    CardItemView,
    CardMoveView,
)


app_name = "boards"


urlpatterns = [
    path("boards", BoardListCreateView.as_view(), name="list_create"),
    path("boards/<str:board_ref>", BoardDetailView.as_view(), name="detail"),
    path(
        "boards/<str:board_id>/cards", CardCreateView.as_view(), name="cards_create"
    ),
    path("boards/cards/<str:card_id>", CardItemView.as_view(), name="card_item"),
    path(
        "boards/cards/<str:card_id>/move",
        CardMoveView.as_view(),
        name="card_move",
    ),
]
