"""
Call service for Rise AI Academy.
Manages student voice counseling sessions, duration tracking,
and call completion records.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone

from config import get_settings
from database import db_insert, db_update, db_select
from services.scoring import score_course_lead
from services.conversation import generate_call_summary

logger = logging.getLogger("riseagent.call_service")


async def initiate_call(lead_id: str, phone: str, course_id: str = "") -> dict:
    """Initiate a voice counseling session for a student."""
    leads = await db_select("leads", filters={"id": lead_id})
    lead_name = leads[0].get("name", "Learner") if leads else "Learner"

    call_id = f"call_{uuid.uuid4().hex[:8]}"
    call_record = {
        "id": call_id,
        "lead_id": lead_id,
        "lead_name": lead_name,
        "phone": phone,
        "status": "in_progress",
        "duration_seconds": 0,
        "language_used": "English",
        "sentiment": "Inquiring",
        "lead_score": 70,
        "classification": "warm",
        "summary": "In-progress counseling call.",
        "started_at": datetime.now(timezone.utc).isoformat(),
    }
    result = await db_insert("calls", call_record)
    logger.info("Call record created: %s for lead %s", call_id, lead_id)
    return result


async def end_call(call_id: str, duration_seconds: int, transcript_text: str = "", sentiment: str = "Interested") -> dict:
    """Finalize a call record with score and summary."""
    score_res = await score_course_lead(transcript_text, sentiment=sentiment, duration_seconds=duration_seconds)
    summary_res = await generate_call_summary(transcript_text)

    update_data = {
        "status": "completed",
        "duration_seconds": duration_seconds,
        "sentiment": sentiment,
        "lead_score": score_res["total_score"],
        "classification": score_res["classification"],
        "summary": summary_res["summary"],
        "key_objection": summary_res["key_objection"],
        "recommended_action": summary_res["recommended_action"],
        "ended_at": datetime.now(timezone.utc).isoformat(),
    }
    updated = await db_update("calls", call_id, update_data)
    return updated
