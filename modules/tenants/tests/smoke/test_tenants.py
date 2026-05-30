"""tenants@v1 smoke — create, members, role gates, owner protection."""
import pytest


@pytest.mark.asyncio
async def test_owner_creates_tenant_and_is_first_member(
    client, customer_headers
):
    created = await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "Acme", "slug": "acme"},
    )
    assert created.status_code == 201

    members = await client.get(
        "/api/tenants/acme/members", headers=customer_headers
    )
    roles = [m["role"] for m in members.json()["items"]]
    assert roles == ["owner"]


@pytest.mark.asyncio
async def test_slug_uniqueness_is_enforced(client, customer_headers):
    await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "A", "slug": "shared"},
    )
    second = await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "B", "slug": "shared"},
    )
    assert second.status_code == 409
    assert second.json()["detail"]["code"] == "TENANT_SLUG_TAKEN"


@pytest.mark.asyncio
async def test_non_member_cannot_see_tenant(
    client, customer_headers, other_customer_headers
):
    await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "Private", "slug": "private"},
    )
    res = await client.get("/api/tenants/private", headers=other_customer_headers)
    assert res.status_code == 403


@pytest.mark.asyncio
async def test_owner_invites_member(
    client, customer_headers, other_customer_id
):
    await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "A", "slug": "team"},
    )
    res = await client.post(
        "/api/tenants/team/members",
        headers=customer_headers,
        json={"userId": other_customer_id, "role": "member"},
    )
    assert res.status_code == 201
    assert res.json()["role"] == "member"


@pytest.mark.asyncio
async def test_member_cannot_invite(
    client,
    customer_headers,
    other_customer_headers,
    other_customer_id,
):
    await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "A", "slug": "team2"},
    )
    await client.post(
        "/api/tenants/team2/members",
        headers=customer_headers,
        json={"userId": other_customer_id, "role": "member"},
    )
    forbidden = await client.post(
        "/api/tenants/team2/members",
        headers=other_customer_headers,
        json={"userId": "u-rando", "role": "member"},
    )
    assert forbidden.status_code == 403


@pytest.mark.asyncio
async def test_owner_cannot_be_demoted_or_removed(
    client, customer_headers, customer_id
):
    await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "A", "slug": "solo"},
    )
    demote = await client.patch(
        f"/api/tenants/solo/members/{customer_id}",
        headers=customer_headers,
        json={"role": "member"},
    )
    assert demote.status_code == 409
    assert demote.json()["detail"]["code"] == "TENANT_OWNER_DEMOTE"

    remove = await client.delete(
        f"/api/tenants/solo/members/{customer_id}",
        headers=customer_headers,
    )
    assert remove.status_code == 409
    assert remove.json()["detail"]["code"] == "TENANT_OWNER_REMOVE"


@pytest.mark.asyncio
async def test_invite_is_idempotent(
    client, customer_headers, other_customer_id
):
    await client.post(
        "/api/tenants",
        headers=customer_headers,
        json={"name": "A", "slug": "idem"},
    )
    for _ in range(3):
        await client.post(
            "/api/tenants/idem/members",
            headers=customer_headers,
            json={"userId": other_customer_id, "role": "member"},
        )
    members = await client.get(
        "/api/tenants/idem/members", headers=customer_headers
    )
    user_ids = [m["userId"] for m in members.json()["items"]]
    assert user_ids.count(other_customer_id) == 1
