"""Twilio status callback webhook.

Twilio POSTs message status changes (queued/sent/delivered/failed) to a
configured statusCallback URL. We verify X-Twilio-Signature = base64(
HMAC-SHA1(auth_token, request_url + sorted_form_params)) and update the
matching NotificationLog row by MessageSid → provider_id.

Twilio sends application/x-www-form-urlencoded — NOT JSON.
"""
import base64
import hashlib
import hmac
import os

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Annotated

from app.database import get_db
from app.notifications.model import NotificationLog


router = APIRouter()


# Twilio status → our NotificationLog.status mapping.
_STATUS_MAP = {
    "queued": "sent",
    "sent": "sent",
    "delivered": "sent",  # terminal success
    "undelivered": "failed",
    "failed": "failed",
}


def _verify(
    auth_token: str, url: str, params: dict[str, str], signature: str
) -> bool:
    # Twilio's algorithm: url + sorted-by-key concat(key + value)
    payload = url + "".join(
        k + params[k] for k in sorted(params.keys())
    )
    digest = hmac.new(
        auth_token.encode("utf-8"),
        payload.encode("utf-8"),
        hashlib.sha1,
    ).digest()
    expected = base64.b64encode(digest).decode("utf-8")
    return hmac.compare_digest(expected, signature)


@router.post("/twilio/status", status_code=200)
async def twilio_status(
    request: Request,
    db: Annotated[AsyncSession, Depends(get_db)],
    x_twilio_signature: Annotated[
        str | None, Header(alias="X-Twilio-Signature")
    ] = None,
):
    if not x_twilio_signature:
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_MISSING_SIGNATURE",
                "message": "X-Twilio-Signature header is required.",
            },
        )

    form = await request.form()
    params = {k: str(v) for k, v in form.items()}
    url = str(request.url)

    auth_token = os.environ.get("TWILIO_AUTH_TOKEN", "")
    if not _verify(auth_token, url, params, x_twilio_signature):
        raise HTTPException(
            status_code=400,
            detail={
                "code": "WEBHOOK_INVALID_SIGNATURE",
                "message": "Twilio signature mismatch.",
            },
        )

    sid = params.get("MessageSid", "")
    twilio_status = params.get("MessageStatus", "")
    new_status = _STATUS_MAP.get(twilio_status)
    if sid and new_status:
        # Update by provider_id — we stored the Twilio SID there at send time.
        result = await db.execute(
            select(NotificationLog).where(NotificationLog.provider_id == sid)
        )
        row = result.scalar_one_or_none()
        if row is not None:
            row.status = new_status
            if twilio_status in ("undelivered", "failed"):
                row.error = params.get("ErrorMessage") or "delivery failed"
            await db.flush()

    return {"received": True, "status": twilio_status}
