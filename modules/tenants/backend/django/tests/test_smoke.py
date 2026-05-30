"""tenants Django smoke — create, members, role gates, ownership transfer."""
import pytest


@pytest.mark.django_db
def test_owner_creates_tenant_and_is_first_member(api_client, customer_headers):
    created = api_client.post(
        "/api/tenants",
        {"name": "Acme", "slug": "acme"},
        format="json",
        **customer_headers,
    )
    assert created.status_code == 201
    members = api_client.get("/api/tenants/acme/members", **customer_headers)
    roles = [m["role"] for m in members.json()["items"]]
    assert roles == ["owner"]


@pytest.mark.django_db
def test_slug_uniqueness_is_enforced(api_client, customer_headers):
    api_client.post(
        "/api/tenants", {"name": "A", "slug": "shared"}, format="json", **customer_headers
    )
    second = api_client.post(
        "/api/tenants", {"name": "B", "slug": "shared"}, format="json", **customer_headers
    )
    assert second.status_code == 409
    assert second.json()["code"] == "TENANT_SLUG_TAKEN"


@pytest.mark.django_db
def test_non_member_cannot_see_tenant(
    api_client, customer_headers, other_customer_headers
):
    api_client.post(
        "/api/tenants", {"name": "Private", "slug": "private"},
        format="json", **customer_headers,
    )
    forbidden = api_client.get("/api/tenants/private", **other_customer_headers)
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_owner_invites_member(
    api_client, customer_headers, other_customer_id
):
    api_client.post(
        "/api/tenants", {"name": "A", "slug": "team"},
        format="json", **customer_headers,
    )
    invited = api_client.post(
        "/api/tenants/team/members",
        {"userId": other_customer_id, "role": "member"},
        format="json",
        **customer_headers,
    )
    assert invited.status_code == 201
    assert invited.json()["role"] == "member"


@pytest.mark.django_db
def test_member_cannot_invite(
    api_client, customer_headers, other_customer_headers, other_customer_id
):
    api_client.post(
        "/api/tenants", {"name": "A", "slug": "team2"},
        format="json", **customer_headers,
    )
    api_client.post(
        "/api/tenants/team2/members",
        {"userId": other_customer_id, "role": "member"},
        format="json",
        **customer_headers,
    )
    forbidden = api_client.post(
        "/api/tenants/team2/members",
        {"userId": "u-rando", "role": "member"},
        format="json",
        **other_customer_headers,
    )
    assert forbidden.status_code == 403
