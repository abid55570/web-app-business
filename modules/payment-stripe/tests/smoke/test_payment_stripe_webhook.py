"""payment-stripe webhook smoke (FastAPI).

Verifies signature-verify gate, event dispatch onto the in-process bus,
and idempotency on Stripe's at-least-once delivery.
"""
from types import SimpleNamespace

import pytest

from app.events_bus.bus import clear_subscribers, list_subscribers, subscribe
from app.payment_stripe.adapters import register_stripe_for_tests
from app.payment_stripe.webhooks import reset_seen_event_ids


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

    # Re-export PaymentIntent + Refund stubs that adapters.py expects to
    # exist in case anything pokes them during this test.
    return SimpleNamespace(
        Webhook=_Webhook,
        PaymentIntent=SimpleNamespace(create=lambda **k: {}, capture=lambda i: {}),
        Refund=SimpleNamespace(create=lambda **k: {}),
    )


def _data_object(**fields) -> dict:
    """Stripe event objects look like {data: {object: {...}}}."""
    return {"data": {"object": fields}}


@pytest.mark.asyncio
async def test_missing_signature_returns_400(client):
    res = await client.post("/api/webhooks/stripe", content=b"{}")
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "WEBHOOK_MISSING_SIGNATURE"


@pytest.mark.asyncio
async def test_invalid_signature_returns_400(client):
    register_stripe_for_tests(
        _fake_stripe(raise_on_construct=ValueError("bad sig"))
    )
    res = await client.post(
        "/api/webhooks/stripe",
        content=b"{}",
        headers={"Stripe-Signature": "t=1,v1=deadbeef"},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "WEBHOOK_INVALID_SIGNATURE"


@pytest.mark.asyncio
async def test_payment_intent_succeeded_emits_payment_succeeded(client):
    seen: list[dict] = []

    async def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.succeeded", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_1",
                "type": "payment_intent.succeeded",
                **_data_object(
                    id="pi_test_123",
                    amount=2500,  # $25.00 in cents
                    currency="usd",
                ),
            }
        )
    )

    res = await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_1"}',
        headers={"Stripe-Signature": "t=1,v1=ok"},
    )
    assert res.status_code == 200
    assert res.json() == {"received": True}
    assert seen == [
        {
            "intentId": "pi_test_123",
            "transactionId": "pi_test_123",
            "amount": 25.0,
            "currency": "USD",
        }
    ]


@pytest.mark.asyncio
async def test_payment_intent_failed_emits_payment_failed(client):
    seen: list[dict] = []

    async def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.failed", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_2",
                "type": "payment_intent.payment_failed",
                **_data_object(
                    id="pi_bad_1",
                    last_payment_error={"message": "Your card was declined."},
                ),
            }
        )
    )

    await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_2"}',
        headers={"Stripe-Signature": "t=1,v1=ok"},
    )
    assert seen == [
        {"intentId": "pi_bad_1", "reason": "Your card was declined."}
    ]


@pytest.mark.asyncio
async def test_charge_refunded_emits_payment_refunded(client):
    seen: list[dict] = []

    async def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.refunded", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_3",
                "type": "charge.refunded",
                **_data_object(
                    id="ch_x",
                    payment_intent="pi_refunded_1",
                    amount_refunded=1000,
                ),
            }
        )
    )

    await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_3"}',
        headers={"Stripe-Signature": "t=1,v1=ok"},
    )
    assert seen == [{"transactionId": "pi_refunded_1", "amount": 10.0}]


@pytest.mark.asyncio
async def test_replay_with_same_event_id_is_deduped(client):
    seen: list[dict] = []

    async def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.succeeded", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_dup",
                "type": "payment_intent.succeeded",
                **_data_object(id="pi_x", amount=100, currency="usd"),
            }
        )
    )

    first = await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_dup"}',
        headers={"Stripe-Signature": "t=1,v1=ok"},
    )
    second = await client.post(
        "/api/webhooks/stripe",
        content=b'{"id":"evt_dup"}',
        headers={"Stripe-Signature": "t=1,v1=ok"},
    )
    assert first.status_code == 200
    assert second.json() == {"received": True, "duplicate": True}
    assert len(seen) == 1
    # also confirms the bus subscriber list survived between requests
    assert len(list_subscribers("payment.succeeded")) == 1


@pytest.mark.asyncio
async def test_unknown_event_type_acknowledged_without_emit(client):
    seen: list[dict] = []

    async def handler(payload, _db):
        seen.append(payload)

    clear_subscribers()
    subscribe("payment.succeeded", handler)

    register_stripe_for_tests(
        _fake_stripe(
            construct_result={
                "id": "evt_other",
                "type": "customer.created",
                **_data_object(id="cus_1"),
            }
        )
    )
    res = await client.post(
        "/api/webhooks/stripe",
        content=b'{}',
        headers={"Stripe-Signature": "t=1,v1=ok"},
    )
    assert res.status_code == 200
    assert seen == []
