"""bookmarks Django smoke — idempotent save, check, my, anon refusal."""
import pytest


@pytest.mark.django_db
def test_save_then_check_returns_true(api_client, customer_headers):
    saved = api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "p1"},
        format="json",
        **customer_headers,
    )
    assert saved.status_code == 201

    check = api_client.get(
        "/api/bookmarks/check?targetType=post&targetId=p1", **customer_headers
    )
    assert check.json()["bookmarked"] is True


@pytest.mark.django_db
def test_save_is_idempotent_and_updates_note(api_client, customer_headers):
    first = api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "p1", "note": "first"},
        format="json",
        **customer_headers,
    )
    assert first.status_code == 201

    second = api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "p1", "note": "updated"},
        format="json",
        **customer_headers,
    )
    assert second.status_code == 200  # not 201 — was an update
    assert second.json()["note"] == "updated"


@pytest.mark.django_db
def test_remove_then_check_returns_false(api_client, customer_headers):
    api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "p2"},
        format="json",
        **customer_headers,
    )
    api_client.delete(
        "/api/bookmarks?targetType=post&targetId=p2", **customer_headers
    )
    check = api_client.get(
        "/api/bookmarks/check?targetType=post&targetId=p2", **customer_headers
    )
    assert check.json()["bookmarked"] is False


@pytest.mark.django_db
def test_my_lists_only_my_saves(
    api_client, customer_headers, other_customer_headers
):
    api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "mine"},
        format="json",
        **customer_headers,
    )
    api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "theirs"},
        format="json",
        **other_customer_headers,
    )

    mine = api_client.get("/api/bookmarks/my", **customer_headers)
    ids = [b["targetId"] for b in mine.json()["items"]]
    assert ids == ["mine"]


@pytest.mark.django_db
def test_anonymous_is_refused(api_client):
    res = api_client.post(
        "/api/bookmarks",
        {"targetType": "post", "targetId": "p1"},
        format="json",
    )
    assert res.status_code in {401, 403}
