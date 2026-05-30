"""bookmarks URLs — single router pattern."""
from django.urls import path

from .views import BookmarkCheckView, BookmarkSaveView, MyBookmarksView


app_name = "bookmarks"


urlpatterns = [
    path("bookmarks", BookmarkSaveView.as_view(), name="save"),
    path("bookmarks/check", BookmarkCheckView.as_view(), name="check"),
    path("bookmarks/my", MyBookmarksView.as_view(), name="my"),
]
