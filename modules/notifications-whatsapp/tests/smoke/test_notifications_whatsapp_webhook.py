"""WhatsApp Cloud webhook smoke (FastAPI)."""
import hashlib
import hmac
import json
import os

import pytest

from app.notifications.model import NotificationLog


@pytest.fixture(autouse=True)
def _set_secrets():
    os.environ["WHATSAPP_VERIFY_TOKEN"] = "verify_test"
    os.environ["WHATSAPP_APP_SECRET"] = "app_secret_test"
    yield


def _sign(payload: bytes) -> str:
    digest = hmac.new(b"app_secret_test", payload, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


@pytest.mark.asyncio
async def test_get_verify_echoes_challenge(client):
    res = await client.get(
        "/api/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "verify_test",
            "hub.challenge": "12345",
        },
    )
    assert res.status_code == 200
    assert res.text == "12345"


@pytest.mark.asyncio
async def test_get_verify_wrong_token_returns_403(client):
    res = await client.get(
        "/api/webhooks/whatsapp",
        params={
            "hub.mode": "subscribe",
            "hub.verify_token": "wrong",
            "hub.challenge": "x",
        },
    )
    assert res.status_code == 403
    assert res.json()["detail"]["code"] == "WEBHOOK_VERIFY_FAILED"


@pytest.mark.asyncio
async def test_post_missing_signature_returns_400(client):
    res = await client.post("/api/webhooks/whatsapp", content=b"{}")
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "WEBHOOK_MISSING_SIGNATURE"


@pytest.mark.asyncio
async def test_post_invalid_signature_returns_400(client):
    res = await client.post(
        "/api/webhooks/whatsapp",
        content=b"{}",
        headers={"X-Hub-Signature-256": "sha256=deadbeef"},
    )
    assert res.status_code == 400
    assert res.json()["detail"]["code"] == "WEBHOOK_INVALID_SIGNATURE"


@pytest.mark.asyncio
async def test_status_delivered_updates_log(client, db_session):
    log = NotificationLog(
        channel="whatsapp",
        recipient="+15551234567",
        template="order.placed",
        status="sent",
        provider_id="wamid.test_1",
    )
    db_session.add(log)
    await db_session.commit()

    body = json.dumps(
        {
            "entry": [
                {
                    "changes": [
                        {
                            "value": {
                                "statuses": [
                                    {"id": "wamid.test_1", "status": "delivered"}
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ).encode("utf-8")
    res = await client.post(
        "/api/webhooks/whatsapp",
        content=body,
        headers={"X-Hub-Signature-256": _sign(body)},
    )
    assert res.status_code == 200
    assert res.json() == {"received": True, "updated": 1}
    await db_session.refresh(log)
    assert log.status == "sent"


@pytest.mark.asyncio
async def test_status_failed_records_error(client, db_session):
    log = NotificationLog(
        channel="whatsapp",
        recipient="+1",
        template="t",
        status="sent",
        provider_id="wamid.fail",
    )
    db_session.add(log)
    await db_session.commit()

    body = json.dumps(
        {
            "entry": [
                {
                    "changes": [
                        {
                            "value": {
                                "statuses": [
                                    {
                                        "id": "wamid.fail",
                                        "status": "failed",
                                        "errors": [{"title": "Recipient not on WhatsApp"}],
                                    }
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    ).encode("utf-8")
    res = await client.post(
        "/api/webhooks/whatsapp",
        content=body,
        headers={"X-Hub-Signature-256": _sign(body)},
    )
    assert res.status_code == 200
    await db_session.refresh(log)
    assert log.status == "failed"
    assert log.error == "Recipient not on WhatsApp"
