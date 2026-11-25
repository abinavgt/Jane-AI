"""
Dashboard router — AI & ML Courses analytics, appointments, and sales insights.
"""

from __future__ import annotations

import logging
from fastapi import APIRouter, Query, HTTPException
from database import db_select, db_count, db_update, db_insert

logger = logging.getLogger("riseagent.routers.dashboard")
router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats")
async def get_dashboard_stats():
    """Return aggregated stats for AI course leads, calls, and appointments."""
    all_leads = await db_select("leads")
    all_calls = await db_select("calls")
    all_appointments = await db_select("appointments")
    all_courses = await db_select("courses")

    total_leads = len(all_leads)
    hot_leads = len([l for l in all_leads if l.get("status") == "hot"])
    warm_leads = len([l for l in all_leads if l.get("status") == "warm"])
    cold_leads = len([l for l in all_leads if l.get("status") == "cold"])
    enrolled = len([l for l in all_leads if l.get("status") == "enrolled"])

    conversion_pct = round((hot_leads / total_leads * 100) if total_leads > 0 else 0, 1)

    # Funnel stages
    contacted = len([c for c in all_calls if c.get("duration_seconds", 0) > 0])
    engaged = len([c for c in all_calls if c.get("duration_seconds", 0) > 60])
    demos_booked = len(all_appointments)

    # Language breakdown
    lang_counts = {"English": 0, "Hindi": 0, "Tamil": 0}
    for c in all_calls:
        lang = c.get("language_used", "English")
        if "tamil" in lang.lower():
            lang_counts["Tamil"] += 1
        elif "hindi" in lang.lower():
            lang_counts["Hindi"] += 1
        else:
            lang_counts["English"] += 1

    # Sentiment breakdown
    sentiment_counts = {"Enthusiastic": 0, "Interested": 0, "Hesitant": 0}
    for c in all_calls:
        s = c.get("sentiment", "Interested")
        if "Enthusiastic" in s or "hot" in c.get("classification", ""):
            sentiment_counts["Enthusiastic"] += 1
        elif "Hesitant" in s:
            sentiment_counts["Hesitant"] += 1
        else:
            sentiment_counts["Interested"] += 1

    # Recent calls with insights
    recent_calls = await db_select("calls", order_by="started_at", order_desc=True, limit=10)

    return {
        "stats": {
            "total_leads": total_leads,
            "hot": hot_leads,
            "warm": warm_leads,
            "cold": cold_leads,
            "enrolled": enrolled,
            "conversion_pct": conversion_pct,
            "total_appointments": len(all_appointments),
        },
        "funnel": {
            "inquiries": total_leads,
            "contacted": max(contacted, total_leads),
            "engaged": engaged,
            "qualified": hot_leads + warm_leads,
            "demos_booked": demos_booked,
        },
        "distribution": {
            "hot": hot_leads,
            "warm": warm_leads,
            "cold": cold_leads,
            "pending": max(total_leads - (hot_leads + warm_leads + cold_leads), 0),
        },
        "languages": lang_counts,
        "sentiments": sentiment_counts,
        "recent_calls": recent_calls,
        "courses": all_courses,
        "appointments": all_appointments,
    }


@router.get("/appointments")
async def get_all_appointments():
    """Return all counseling and demo appointments for CRM integration."""
    return await db_select("appointments", order_by="created_at", order_desc=True)


@router.put("/appointments/{appointment_id}/status")
async def update_appointment_status(appointment_id: str, status: str = Query(...)):
    """Update status of an appointment (e.g., confirmed, completed, rescheduled)."""
    updated = await db_update("appointments", appointment_id, {"status": status})
    return {"success": True, "appointment": updated}


@router.get("/courses")
async def list_courses():
    """List all AI & ML courses."""
    return await db_select("courses")
