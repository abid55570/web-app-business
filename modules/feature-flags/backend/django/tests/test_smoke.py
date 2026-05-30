"""feature-flags Django smoke — CRUD + resolution layers."""
import pytest


@pytest.mark.django_db
def test_unknown_key_is_disabled(api_client):
    res = api_client.get("/api/feature-flags/check/unknown")
    assert res.status_code == 200
    assert res.json()["enabled"] is False


@pytest.mark.django_db
def test_disabled_flag_kills_audience_match(api_client, admin_headers):
    api_client.post(
        "/api/admin/feature-flags",
        {
            "key": "billing-v2",
            "enabled": False,
            "audiences": ["tenant:acme"],
            "rolloutPercent": 100,
        },
        format="json",
        **admin_headers,
    )
    res = api_client.get(
        "/api/feature-flags/check/billing-v2?audience=tenant:acme"
    )
    assert res.json()["enabled"] is False


@pytest.mark.django_db
def test_audience_match_enables(api_client, admin_headers):
    api_client.post(
        "/api/admin/feature-flags",
        {
            "key": "beta-ui",
            "enabled": True,
            "audiences": ["tenant:acme"],
            "rolloutPercent": 0,
        },
        format="json",
        **admin_headers,
    )
    yes = api_client.get(
        "/api/feature-flags/check/beta-ui?audience=tenant:acme"
    )
    no = api_client.get(
        "/api/feature-flags/check/beta-ui?audience=tenant:other"
    )
    assert yes.json()["enabled"] is True
    assert no.json()["enabled"] is False


@pytest.mark.django_db
def test_full_rollout_enables_everyone(api_client, admin_headers):
    api_client.post(
        "/api/admin/feature-flags",
        {
            "key": "ga-feature",
            "enabled": True,
            "rolloutPercent": 100,
        },
        format="json",
        **admin_headers,
    )
    yes = api_client.get(
        "/api/feature-flags/check/ga-feature?audience=anyone"
    )
    assert yes.json()["enabled"] is True


@pytest.mark.django_db
def test_admin_routes_require_admin(api_client, customer_headers):
    forbidden = api_client.post(
        "/api/admin/feature-flags",
        {"key": "x", "enabled": True},
        format="json",
        **customer_headers,
    )
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_key_uniqueness_is_enforced(api_client, admin_headers):
    api_client.post(
        "/api/admin/feature-flags",
        {"key": "dup", "enabled": True},
        format="json",
        **admin_headers,
    )
    second = api_client.post(
        "/api/admin/feature-flags",
        {"key": "dup", "enabled": False},
        format="json",
        **admin_headers,
    )
    assert second.status_code == 409
    assert second.json()["code"] == "FLAG_KEY_TAKEN"
