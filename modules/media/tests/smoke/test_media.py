"""media@v1 smoke — register, public list, owner-only edit/delete, size cap."""
import pytest


SAMPLE = {
    "kind": "image",
    "originalName": "hero.jpg",
    "mimeType": "image/jpeg",
    "sizeBytes": 12345,
    "url": "https://cdn.example.com/hero.jpg",
}


@pytest.mark.asyncio
async def test_owner_registers_and_public_lists(client, customer_headers):
    res = await client.post("/api/media", headers=customer_headers, json=SAMPLE)
    assert res.status_code == 201

    listing = await client.get("/api/media")
    urls = [m["url"] for m in listing.json()["items"]]
    assert SAMPLE["url"] in urls


@pytest.mark.asyncio
async def test_anonymous_can_get_detail(client, customer_headers):
    created = await client.post("/api/media", headers=customer_headers, json=SAMPLE)
    mid = created.json()["id"]
    res = await client.get(f"/api/media/{mid}")
    assert res.status_code == 200


@pytest.mark.asyncio
async def test_other_user_cannot_delete(
    client, customer_headers, other_customer_headers
):
    created = await client.post("/api/media", headers=customer_headers, json=SAMPLE)
    mid = created.json()["id"]
    res = await client.delete(f"/api/media/{mid}", headers=other_customer_headers)
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "AUTH_FORBIDDEN"


@pytest.mark.asyncio
async def test_owner_can_patch_alt_text(client, customer_headers):
    created = await client.post("/api/media", headers=customer_headers, json=SAMPLE)
    mid = created.json()["id"]
    patched = await client.patch(
        f"/api/media/{mid}",
        headers=customer_headers,
        json={"altText": "sunset over the bay"},
    )
    assert patched.status_code == 200
    assert patched.json()["altText"] == "sunset over the bay"


@pytest.mark.asyncio
async def test_oversize_is_rejected(client, customer_headers):
    bad = dict(SAMPLE, sizeBytes=30_000_000)
    res = await client.post("/api/media", headers=customer_headers, json=bad)
    assert res.status_code == 422  # Pydantic ge/le violation


@pytest.mark.asyncio
async def test_kind_filter(client, customer_headers):
    await client.post("/api/media", headers=customer_headers, json=SAMPLE)
    await client.post(
        "/api/media",
        headers=customer_headers,
        json=dict(SAMPLE, kind="video", mimeType="video/mp4", url="https://x/v.mp4"),
    )
    only_video = await client.get("/api/media?kind=video")
    kinds = {m["kind"] for m in only_video.json()["items"]}
    assert kinds == {"video"}
