"""Root URL config.

The wirer overwrites this file post-copy with one ``path("api/<id>/",
include("<id>.urls"))`` line per module that ships a ``urls.py`` for the
chosen stack. Until that derive step runs, only /healthz is exposed.
"""
from django.http import JsonResponse
from django.urls import path


def healthz(_request):
    return JsonResponse({"status": "ok"})


urlpatterns = [
    path("healthz", healthz, name="healthz"),
]
