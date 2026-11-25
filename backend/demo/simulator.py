"""
Demo simulation engine for Rise AI Academy.
Simulates AI & ML course inquiries in English, Hindi, and Tamil.
"""

from __future__ import annotations

import json
import logging
import random
from pathlib import Path
from datetime import datetime, timezone, timedelta

from database import db_insert, db_update, db_select
from services.conversation import ConversationSession, generate_call_summary
from services.scoring import score_course_lead
from services.language import get_language_name

logger = logging.getLogger("riseagent.demo")

PERSONAS_FILE = Path(__file__).parent / "personas.json"


def load_personas() -> list[dict]:
    with open(PERSONAS_FILE, "r", encoding="utf-8") as f:
        return json.load(f)


def get_persona_by_phone(phone: str) -> dict | None:
    for p in load_personas():
        if p["phone"] == phone:
            return p
    return None


async def simulate_call(lead_id: str, persona: dict) -> dict:
    """Run an automated demo counseling simulation for a lead."""
    lead_name = persona["name"]
    lang_code = persona["language"]
    lang_name = get_language_name(lang_code)
    course = persona.get("course_of_interest", "Executive Masterclass in Generative AI & LLMs")

    session = ConversationSession(
        session_id=f"demo_sess_{lead_id}",
        lead_id=lead_id,
        lead_name=lead_name,
        phone=persona["phone"],
        language=lang_code,
    )
    session.target_course = course

    # Simulate realistic inquiries
    sample_queries = {
        "hi-IN": [
            "नमस्ते, मुझे Generative AI और LLM कोर्स के बारे में जानना है। क्या इसमें प्रोजेक्ट्स शामिल हैं?",
            "क्या आप प्लेसमेंट सहायता और 0% EMI ऑफर करते हैं?",
            "बहुत अच्छा! क्या मैं कल शाम 4:30 बजे 1-on-1 डेमो सेशन बुक कर सकता हूँ?",
        ],
        "ta-IN": [
            "Vanakkam, Full-Stack Machine Learning matrum MLOps course syllabus pathi therinjukalamngala?",
            "Naan college final year, placements kandippa kedaikkuma? Companies list enna?",
            "Super! Enakku oru demo session book pannunga, mentor kooda discuss pannanum.",
        ],
        "en-IN": [
            "Hello, I am interested in the AI Foundations and Machine Learning program.",
            "I don't have a strong coding background. How does your zero-to-hero bridge module work?",
            "That sounds reassuring. Could you please book a 1-on-1 demo call with a senior counselor?",
        ],
    }

    queries = sample_queries.get(lang_code, sample_queries["en-IN"])
    last_res = {}
    for q in queries:
        last_res = await session.process_student_speech(q)

    # Calculate duration & score
    duration = random.randint(120, 240)
    sentiment = "Enthusiastic" if persona["final_classification"] == "hot" else "Interested"
    summary_obj = await generate_call_summary(session.get_context_memory_str())

    call_record = {
        "id": f"call_{lead_id}",
        "lead_id": lead_id,
        "lead_name": lead_name,
        "phone": persona["phone"],
        "status": "completed",
        "duration_seconds": duration,
        "language_used": lang_name,
        "sentiment": sentiment,
        "lead_score": 85 if persona["final_classification"] == "hot" else 65,
        "classification": persona["final_classification"],
        "summary": summary_obj["summary"],
        "key_objection": summary_obj["key_objection"],
        "recommended_action": summary_obj["recommended_action"],
        "started_at": (datetime.now(timezone.utc) - timedelta(minutes=5)).isoformat(),
        "ended_at": datetime.now(timezone.utc).isoformat(),
    }
    await db_insert("calls", call_record)

    # Update lead status
    await db_update("leads", lead_id, {
        "status": persona["final_classification"],
        "sentiment": sentiment,
        "score": call_record["lead_score"],
    })

    return call_record
