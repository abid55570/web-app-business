"""likes Django smoke — toggle idempotency, count, anon-tolerant for-target."""
import pytest


@pytest.mark.django_db
def test_first_post_likes_second_unlikes(api_client, customer_headers):
    a = api_client.post(
        "/api/likes",
        {"targetType": "post", "targetId": "p1"},
        format="json",
        **customer_headers,
    )
    assert a.status_code == 200
    assert a.json()["liked"] is True
    assert a.json()["count"] == 1

    b = api_client.post(
        "/api/likes",
        {"targetType": "post", "targetId": "p1"},
        format="json",
        **customer_headers,
    )
    assert b.status_code == 200
    assert b.json()["liked"] is False
    assert b.json()["count"] == 0


@pytest.mark.django_db
def test_anon_can_read_count_but_likedByMe_is_false(
    api_client, customer_headers
):
    api_client.post(
        "/api/likes",
        {"targetType": "post", "targetId": "anon-read"},
        format="json",
        **customer_headers,
    )
    res = api_client.get("/api/likes/for-target?targetType=post&targetId=anon-read")
    assert res.status_code == 200
    body = res.json()
    assert body["count"] == 1
    assert body["likedByMe"] is False


@pytest.mark.django_db
def test_authed_for_target_returns_likedByMe(api_client, customer_headers):
    api_client.post(
        "/api/likes",
        {"targetType": "post", "targetId": "mine"},
        format="json",
        **customer_headers,
    )
    res = api_client.get(
        "/api/likes/for-target?targetType=post&targetId=mine", **customer_headers
    )
    assert res.json()["likedByMe"] is True


@pytest.mark.django_db
def test_anonymous_cannot_toggle(api_client):
    res = api_client.post(
        "/api/likes",
        {"targetType": "post", "targetId": "p1"},
        format="json",
    )
    assert res.status_code in {401, 403}


@pytest.mark.django_db
def test_my_likes_lists_targets(api_client, customer_headers):
    for tid in ("a", "b", "c"):
        api_client.post(
            "/api/likes",
            {"targetType": "post", "targetId": tid},
            format="json",
            **customer_headers,
        )
    res = api_client.get("/api/likes/my", **customer_headers)
    ids = sorted(l["targetId"] for l in res.json()["items"])
    assert ids == ["a", "b", "c"]
