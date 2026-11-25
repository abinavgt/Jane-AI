"""
Calls router — AI course counseling call management and detail records.
"""

from __future__ import annotations

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query
from database import db_select, db_insert

logger = logging.getLogger("riseagent.routers.calls")
router = APIRouter(prefix="/calls", tags=["calls"])


@router.get("")
async def list_calls(
    lead_id: Optional[str] = Query(default=None),
    limit: int = Query(default=20, ge=1, le=100),
):
    """List student calls."""
    filters = {}
    if lead_id:
        filters["lead_id"] = lead_id
    calls = await db_select("calls", filters=filters, order_by="started_at", order_desc=True, limit=limit)
    return calls


@router.get("/{call_id}")
async def get_call_detail(call_id: str):
    """Get full call detail with events, transcript, sentiment, and summary."""
    calls = await db_select("calls", filters={"id": call_id})
    if not calls:
        raise HTTPException(status_code=404, detail="Call not found")
    call = calls[0]

    events = await db_select("call_events", filters={"call_id": call_id}, order_by="turn_number", order_desc=False)

    lead = None
    if call.get("lead_id"):
        leads = await db_select("leads", filters={"id": call["lead_id"]})
        lead = leads[0] if leads else None

    return {
        "call": call,
        "events": events,
        "lead": lead,
    }
