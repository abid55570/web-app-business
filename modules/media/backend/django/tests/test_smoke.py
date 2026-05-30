"""media Django smoke — register, list, owner-only edit/delete."""
import pytest


SAMPLE = {
    "kind": "image",
    "originalName": "hero.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 12345,
    "url": "https://cdn.example.com/hero.jpg",
}


@pytest.mark.django_db
def test_owner_registers_and_public_lists(api_client, customer_headers):
    create = api_client.post("/api/media", SAMPLE, format="json", **customer_headers)
    assert create.status_code == 201

    listing = api_client.get("/api/media")
    urls = [m["url"] for m in listing.json()["items"]]
    assert SAMPLE["url"] in urls


@pytest.mark.django_db
def test_anonymous_can_get_detail(api_client, customer_headers):
    created = api_client.post("/api/media", SAMPLE, format="json", **customer_headers)
    mid = created.json()["id"]
    res = api_client.get(f"/api/media/{mid}")
    assert res.status_code == 200


@pytest.mark.django_db
def test_other_user_cannot_delete(
    api_client, customer_headers, other_customer_headers
):
    created = api_client.post("/api/media", SAMPLE, format="json", **customer_headers)
    mid = created.json()["id"]
    forbidden = api_client.delete(f"/api/media/{mid}", **other_customer_headers)
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_oversize_is_rejected(api_client, customer_headers):
    bad = dict(SAMPLE, sizeBytes=30_000_000)
    res = api_client.post("/api/media", bad, format="json", **customer_headers)
    assert res.status_code == 400


@pytest.mark.django_db
def test_invalid_kind_rejected(api_client, customer_headers):
    bad = dict(SAMPLE, kind="audio")
    res = api_client.post("/api/media", bad, format="json", **customer_headers)
    assert res.status_code == 400
