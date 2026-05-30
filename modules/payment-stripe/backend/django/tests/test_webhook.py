"""payment-stripe Django webhook smoke."""
from types import SimpleNamespace

import pytest

from events_bus.bus import clear_subscribers, subscribe
from payment_stripe.webhooks import register_stripe_for_tests, reset_seen_event_ids


@pytest.fixture(autouse=True)
def _reset():
    reset_seen_event_ids()
    yield
    reset_seen_event_ids()


def _fake_stripe(construct_result=None, raise_on_construct=None):
    class _Webhook:
        @staticmethod
        def construct_event(payload, sig_header, secret):
            if raise_on_construct is not None:
                raise raise_on_construct
            return construct_result

    return SimpleNamespace(
        Webhook=_Webhook,
        PaymentIntent=SimpleNamespace(create=lambda **k: {}, capture=lambda i: {}),
        Refund=SimpleNamespace(create=lambda **k: {}),
    )


def _data(**fields) -> dict:
    return {"data": {"object": fields}}


def test_missing_signature_returns_400(api_client):
    res = api_client.post(
        "/api/webhooks/stripe", data="{}", content_type="application/json"
    )
    assert res.status_code == 400
    assert res.json()["code"] == "WEBHOOK_MISSING_SIGNATURE"


def test_invalid_signature_returns_400(api_client):
    register_stripe_for_tests(_fake_stripe(raise_on_construct=ValueError("bad")))
    res = api_client.post(
        "/api/webhooks/stripe",
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="t=1,v1=deadbeef",
    )
    assert res.status_code == 400
    assert res.json()["code"] == "WEBHOOK_INVALID_SIGNATURE"


def test_payment_intent_succeeded_emits_payment_succeeded(api_client):
    seen: list[dict] = []

    def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.succeeded", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_1",
                "type": "payment_intent.succeeded",
                **_data(id="pi_test_1", amount=2500, currency="usd"),
            }
        )
    )
    res = api_client.post(
        "/api/webhooks/stripe",
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="t=1,v1=ok",
    )
    assert res.status_code == 200
    assert seen == [
        {
            "intentId": "pi_test_1",
            "transactionId": "pi_test_1",
            "amount": 25.0,
            "currency": "USD",
        }
    ]


def test_replay_with_same_event_id_is_deduped(api_client):
    seen: list[dict] = []

    def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.succeeded", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_dup",
                "type": "payment_intent.succeeded",
                **_data(id="pi_x", amount=100, currency="usd"),
            }
        )
    )

    first = api_client.post(
        "/api/webhooks/stripe",
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="t=1,v1=ok",
    )
    second = api_client.post(
        "/api/webhooks/stripe",
        data="{}",
        content_type="application/json",
        HTTP_STRIPE_SIGNATURE="t=1,v1=ok",
    )
    assert first.status_code == 200
    assert second.json() == {"received": True, "duplicate": True}
    assert len(seen) == 1
