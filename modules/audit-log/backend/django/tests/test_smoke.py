"""audit-log Django smoke — record + admin filtered list + admin gate."""
import pytest


@pytest.mark.django_db
def test_user_records_event_admin_sees_it(
    api_client, customer_headers, admin_headers
):
    recorded = api_client.post(
        "/api/audit",
        {
            "action": "post.publish",
            "targetType": "post",
            "targetId": "p1",
            "metadata": {"slug": "hello-world"},
        },
        format="json",
        **customer_headers,
    )
    assert recorded.status_code == 201

    listing = api_client.get(
        "/api/admin/audit?action=post.publish", **admin_headers
    )
    actions = [e["action"] for e in listing.json()["items"]]
    assert actions == ["post.publish"]


@pytest.mark.django_db
def test_metadata_round_trips_as_dict(api_client, customer_headers, admin_headers):
    api_client.post(
        "/api/audit",
        {"action": "x", "metadata": {"a": 1, "b": "two"}},
        format="json",
        **customer_headers,
    )
    listing = api_client.get("/api/admin/audit?action=x", **admin_headers)
    meta = listing.json()["items"][0]["metadata"]
    assert meta == {"a": 1, "b": "two"}


@pytest.mark.django_db
def test_admin_read_requires_admin(api_client, customer_headers):
    forbidden = api_client.get("/api/admin/audit", **customer_headers)
    assert forbidden.status_code == 403


@pytest.mark.django_db
def test_anon_cannot_record(api_client):
    res = api_client.post(
        "/api/audit", {"action": "x"}, format="json"
    )
    assert res.status_code in {401, 403}


@pytest.mark.django_db
def test_target_filter_narrows_results(
    api_client, customer_headers, admin_headers
):
    for tid in ("a", "b", "a"):
        api_client.post(
            "/api/audit",
            {"action": "post.publish", "targetType": "post", "targetId": tid},
            format="json",
            **customer_headers,
        )
    listing = api_client.get(
        "/api/admin/audit?targetType=post&targetId=a", **admin_headers
    )
    assert listing.json()["total"] == 2
