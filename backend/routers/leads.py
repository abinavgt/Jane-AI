"""
Leads router — AI & ML course inquiries and demo lead seeding.
"""

from __future__ import annotations

import logging
from typing import Optional
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, BackgroundTasks, Query

from database import db_insert, db_select, db_update, reset_database
from demo.simulator import simulate_call, get_persona_by_phone, load_personas

logger = logging.getLogger("riseagent.routers.leads")
router = APIRouter(prefix="/leads", tags=["leads"])


class LeadCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    phone: str = Field(..., pattern=r"^\+?\d{10,15}$")
    email: Optional[str] = None
    course_of_interest: Optional[str] = "Executive Masterclass in Generative AI & LLMs"
    language: Optional[str] = "en-IN"
    source: Optional[str] = "landing-page"


@router.post("/new")
async def create_lead(payload: LeadCreate, background_tasks: BackgroundTasks):
    """Register a new student lead and trigger initial counseling simulation."""
    lead_data = {
        "name": payload.name,
        "phone": payload.phone,
        "email": payload.email or f"{payload.name.lower().replace(' ', '')}@example.com",
        "course_of_interest": payload.course_of_interest,
        "language": payload.language or "en-IN",
        "source": payload.source or "landing-page",
        "status": "hot",
        "sentiment": "Interested",
        "score": 75,
    }
    lead = await db_insert("leads", lead_data)
    lead_id = lead["id"]

    # In demo mode, simulate interaction in background
    persona = get_persona_by_phone(payload.phone)
    if not persona:
        persona = {
            "name": payload.name,
            "phone": payload.phone,
            "language": payload.language or "en-IN",
            "personality": "enthusiastic",
            "course_of_interest": payload.course_of_interest,
            "final_classification": "hot",
        }
    background_tasks.add_task(simulate_call, lead_id, persona)

    return lead


@router.get("")
async def list_leads(
    status: Optional[str] = Query(default=None),
    search: Optional[str] = Query(default=None),
    limit: int = Query(default=50),
):
    """List all student leads."""
    filters = {}
    if status and status != "all":
        filters["status"] = status
    leads = await db_select("leads", filters=filters, order_by="created_at", order_desc=True, limit=limit)
    if search:
        s_lower = search.lower()
        leads = [l for l in leads if s_lower in l.get("name", "").lower() or s_lower in l.get("phone", "")]
    return {"leads": leads, "total": len(leads)}


@router.get("/{lead_id}")
async def get_lead(lead_id: str):
    """Get single lead details."""
    leads = await db_select("leads", filters={"id": lead_id})
    if not leads:
        raise HTTPException(status_code=404, detail="Lead not found")
    return leads[0]


@router.post("/demo/seed")
async def seed_demo_leads(background_tasks: BackgroundTasks):
    """Cleanly re-seed demo AI course leads and trigger simulations."""
    reset_database()
    personas = load_personas()
    for p in personas:
        lead_data = {
            "name": p["name"],
            "phone": p["phone"],
            "email": f"{p['name'].lower().replace(' ', '.')}@example.com",
            "language": p["language"],
            "course_of_interest": p.get("course_of_interest", "Executive Masterclass in Generative AI & LLMs"),
            "status": "pending",
        }
        lead = await db_insert("leads", lead_data)
        background_tasks.add_task(simulate_call, lead["id"], p)

    return {"status": "seeded", "count": len(personas)}
