"""WhatsApp Cloud webhook handlers.

Two endpoints:
  GET  /api/webhooks/whatsapp — Meta's verification challenge (called once
       when wiring the subscription). Echoes hub.challenge if hub.verify_token
       matches WHATSAPP_VERIFY_TOKEN.

  POST /api/webhooks/whatsapp — receives message status updates (sent/
       delivered/read/failed) + inbound messages. Verifies X-Hub-Signature-256
       = "sha256=" + HMAC-SHA256(body, WHATSAPP_APP_SECRET) and updates
       NotificationLog.status by message id (wamid → provider_id).
"""
import hashlib
import hmac
import os
from typing import Annotated, Any

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.notifications.model import NotificationLog


router = APIRouter()


# WhatsApp message.status → our NotificationLog.status.
_STATUS_MAP = {
    "sent": "sent",
    "delivered": "sent",
    "read": "sent",
    "failed": "failed",
}


def _verify(payload: bytes, signature: str) -> bool:
    """``signature`` arrives as ``sha256=<hex>``. Strip prefix, compare."""
    if not signature.startswith("sha256="):
        return False
    expected = hmac.new(
        os.environ.get("WHATSAPP_APP_SECRET", "").encode("utf-8"),
        payload,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature[len("sha256=") :])


@router.get("/whatsapp")
async def whatsapp_verify(
    hub_mode: Annotated[str, Query(alias="hub.mode")] = "",
    hub_verify_token: Annotated[str, Query(alias="hub.verify_token")] = "",
    hub_challenge: Annotated[str, Query(alias="hub.challenge")] = "",
):
    expected_token = os.environ.get("WHATSAPP_VERIFY_TOKEN", "")
    if hub_mode == "subscribe" and hub_verify_token == expected_token:
        # Meta requires the raw challenge string back as plain text.
        from fastapi.responses import PlainTextResponse

        return PlainTextResponse(hub_challenge)
    raise HTTPException(
        status_code=403,
        detail={
            "code": "WEBHOOK_VERIFY_FAILED",
            "message": "hub.verify_token mismatch or missing.",
        },
    )


@router.post("/whatsapp", status_code=200)
async def whatsapp_status(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    x_hub_signature_256: Annotated[
        str | None, Header(alias="X-Hub-Signature-256")
    ] = None,
):
    if not x_hub_signature_256:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_MISSING_SIGNATURE",
                "message": "X-Hub-Signature-256 header is required.",
            },
        )

    payload = await request.body()
    if not _verify(payload, x_hub_signature_256):
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_INVALID_SIGNATURE",
                "message": "WhatsApp signature mismatch.",
            },
        )

    import json

    try:
        event: dict[str, Any] = json.loads(payload.decode("utf-8"))
    except json.JSONDecodeError:
        raise HTTPException(
            status_code=400,
            detail={"code": "WEBHOOK_BAD_JSON", "message": "Body not JSON."},
        )

    # Extract message statuses from the canonical envelope:
    # entry[].changes[].value.statuses[]
    updated = 0
    for entry in event.get("entry", []) or []:
        for change in entry.get("changes", []) or []:
            value = change.get("value", {}) or {}
            for status in value.get("statuses", []) or []:
                wamid = status.get("id", "")
                wstatus = status.get("status", "")
                new_status = _STATUS_MAP.get(wstatus)
                if not (wamid and new_status):
                    continue
                result = await db.execute(
                    select(NotificationLog).where(
                        NotificationLog.provider_id == wamid
                    )
                )
                row = result.scalar_one_or_none()
                if row is None:
                    continue
                row.status = new_status
                if wstatus == "failed":
                    errors = status.get("errors") or []
                    row.error = (errors[0] if errors else {}).get(
                        "title", "delivery failed"
                    )
                updated += 1
    await db.flush()
    return {"received": True, "updated": updated}
