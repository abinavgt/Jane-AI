"""
Course advisor handoff and post-call routing service for AI courses.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone, timedelta
from database import db_insert, db_update

logger = logging.getLogger("riseagent.rm_handoff")


async def route_lead_post_call(
    lead_id: str,
    lead_name: str,
    lead_phone: str,
    call_id: str,
    classification: str,
    score: int,
    transcript: str,
    objections_raised: list[str],
    rebuttals_used: list[str],
    language: str,
) -> dict:
    """Route a lead based on qualification score after call ends."""
    if classification == "hot":
        # Create priority appointment/queue item
        entry = {
            "lead_id": lead_id,
            "lead_name": lead_name,
            "phone": lead_phone,
            "course_title": "Executive Masterclass in Generative AI & LLMs",
            "appointment_type": "Priority AI Counseling & Demo",
            "slot_date": (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d"),
            "slot_time": "04:30 PM",
            "counselor": "Dr. Rohit Verma (Senior AI Lead)",
            "status": "confirmed",
            "score": score,
            "transcript": transcript,
            "notes": f"Hot Lead (Score {score}). Objections: {', '.join(objections_raised) if objections_raised else 'None'}",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        await db_insert("appointments", entry)
        await db_update("leads", lead_id, {"status": "hot", "score": score})
        return {"action": "appointment_scheduled", "details": entry}
    elif classification == "warm":
        await db_update("leads", lead_id, {"status": "warm", "score": score})
        return {"action": "whatsapp_brochure_scheduled"}
    else:
        await db_update("leads", lead_id, {"status": "cold", "score": score})
        return {"action": "nurture_campaign"}
