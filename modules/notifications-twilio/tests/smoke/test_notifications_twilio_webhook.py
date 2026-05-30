"""Twilio status webhook smoke (FastAPI)."""
import base64
import hashlib
import hmac
import os

import pytest

from app.notifications.model import NotificationLog


@pytest.fixture(autouse=True)
def _set_token():
    os.environ["TWILIO_AUTH_TOKEN"] = "test_token"
    yield


def _sign(url: str, params: dict[str, str]) -> str:
    payload = url + "".join(k + params[k] for k in sorted(params.keys()))
    digest = hmac.new(
        b"test_token", payload.encode("utf-8"), hashlib.sha1
    ).digest()
    return base64.b64encode(digest).decode("utf-8")


@pytest.mark.asyncio
async def test_missing_signature_returns_400(client):
    res = await client.post(
        "/api/webhooks/twilio/status",
        data={"MessageSid": "SM1", "MessageStatus": "delivered"},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "WEBHOOK_MISSING_SIGNATURE"


@pytest.mark.asyncio
async def test_invalid_signature_returns_400(client):
    res = await client.post(
        "/api/webhooks/twilio/status",
        data={"MessageSid": "SM1", "MessageStatus": "delivered"},
        headers={"X-Twilio-Signature": "deadbeef"},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "WEBHOOK_INVALID_SIGNATURE"


@pytest.mark.asyncio
async def test_delivered_updates_log_status(client, db_session):
    # Seed a log row with provider_id matching the SID.
    log = NotificationLog(
        channel="sms",
        recipient="+15551234567",
        template="order.placed",
        status="sent",
        provider_id="SM_test_1",
    )
    db_session.add(log)
    await db_session.commit()

    params = {"MessageSid": "SM_test_1", "MessageStatus": "delivered"}
    url = "http://test/api/webhooks/twilio/status"
    sig = _sign(url, params)

    res = await client.post(
        "/api/webhooks/twilio/status",
        data=params,
        headers={"X-Twilio-Signature": sig},
    )
    assert res.status_code == 200
    assert res.json() == {"received": True, "status": "delivered"}

    await db_session.refresh(log)
    assert log.status == "sent"  # delivered ⊂ sent in our flat status enum


@pytest.mark.asyncio
async def test_failed_status_records_error(client, db_session):
    log = NotificationLog(
        channel="sms",
        recipient="+1",
        template="t",
        status="sent",
        provider_id="SM_fail",
    )
    db_session.add(log)
    await db_session.commit()

    params = {
        "MessageSid": "SM_fail",
        "MessageStatus": "failed",
        "ErrorMessage": "Carrier rejected",
    }
    url = "http://test/api/webhooks/twilio/status"
    sig = _sign(url, params)
    res = await client.post(
        "/api/webhooks/twilio/status",
        data=params,
        headers={"X-Twilio-Signature": sig},
    )
    assert res.status_code == 200
    await db_session.refresh(log)
    assert log.status == "failed"
    assert log.error == "Carrier rejected"


@pytest.mark.asyncio
async def test_unknown_status_acks_without_update(client, db_session):
    log = NotificationLog(
        channel="sms",
        recipient="+1",
        template="t",
        status="sent",
        provider_id="SM_x",
    )
    db_session.add(log)
    await db_session.commit()

    params = {"MessageSid": "SM_x", "MessageStatus": "weird"}
    url = "http://test/api/webhooks/twilio/status"
    sig = _sign(url, params)
    res = await client.post(
        "/api/webhooks/twilio/status",
        data=params,
        headers={"X-Twilio-Signature": sig},
    )
    assert res.status_code == 200
    await db_session.refresh(log)
    assert log.status == "sent"  # unchanged
