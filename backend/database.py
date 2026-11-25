"""
RiseAgent AI — AI & ML Courses Database Layer.
Dedicated database store exclusively for AI & ML course counseling,
lead qualification, voice calls, automated appointment booking, and CRM insights.
"""

from __future__ import annotations

import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import Any, Optional

logger = logging.getLogger("riseagent.database")

def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def _new_id() -> str:
    return str(uuid.uuid4())

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Initial AI & ML Courses Catalog
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INITIAL_COURSES = [
    {
        "id": "course_genai_01",
        "title": "Executive Masterclass in Generative AI & LLMs",
        "category": "Generative AI",
        "duration": "4 Months",
        "level": "Intermediate - Advanced",
        "original_fee": 45000,
        "discounted_fee": 36000,
        "emi_monthly": 3750,
        "format": "Live Weekend Batches (Sat & Sun: 10 AM - 1 PM)",
        "skills": ["Transformers", "Prompt Engineering", "RAG Systems", "LangChain", "CrewAI", "LLM Fine-tuning", "vLLM", "Docker"],
        "capstones": [
            "Enterprise Multilingual Document RAG Engine",
            "Multi-Agent Autonomous Market Research Swarm",
            "Domain-Specific Llama-3 8B Fine-tuning on AWS A10G"
        ],
        "placement_support": "100% Placement Assistance with 5 Guaranteed Interview Calls",
        "enrolled_count": 1420,
        "rating": 4.9,
    },
    {
        "id": "course_mlops_02",
        "title": "Full-Stack Machine Learning & MLOps Engineering",
        "category": "Machine Learning & MLOps",
        "duration": "6 Months",
        "level": "Beginner to Advanced",
        "original_fee": 55000,
        "discounted_fee": 46750,
        "emi_monthly": 4580,
        "format": "Live Weekend Classes + Midweek Labs",
        "skills": ["Python", "PyTorch", "TensorFlow", "Scikit-Learn", "Computer Vision (YOLOv8)", "MLflow", "DVC", "Kubernetes"],
        "capstones": [
            "Real-Time Defect Detection for Autonomous Smart Factory",
            "End-to-End Financial Fraud Detection & Retraining Pipeline"
        ],
        "placement_support": "100% Placement Assistance with 350+ Hiring Partners",
        "enrolled_count": 2180,
        "rating": 4.85,
    },
    {
        "id": "course_foundations_03",
        "title": "Zero-to-Hero: Python, Mathematics & AI Foundations",
        "category": "Foundations",
        "duration": "3 Months",
        "level": "Absolute Beginner (No coding needed)",
        "original_fee": 25000,
        "discounted_fee": 20000,
        "emi_monthly": 2500,
        "format": "Live Evening & Weekend Batches",
        "skills": ["Python Fundamentals", "Data Structures", "Linear Algebra", "Calculus & Probability", "Pandas", "Intro to ML"],
        "capstones": [
            "Customer Churn Prediction Dashboard",
            "Interactive Exploratory Data Analysis Suite"
        ],
        "placement_support": "Internship Guarantee & Junior Role Referral Network",
        "enrolled_count": 3100,
        "rating": 4.92,
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Seed Demo Leads for AI Courses
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INITIAL_LEADS = [
    {
        "id": "lead_001",
        "name": "Aarav Sharma",
        "phone": "+919876543210",
        "email": "aarav.sharma@gmail.com",
        "language": "hi-IN",
        "course_of_interest": "Executive Masterclass in Generative AI & LLMs",
        "experience": "Working Software Engineer (2 yrs)",
        "status": "hot",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=2)).isoformat(),
        "sentiment": "Enthusiastic",
        "score": 88,
    },
    {
        "id": "lead_002",
        "name": "Karthik Sundaram",
        "phone": "+919876543211",
        "email": "karthik.s@gmail.com",
        "language": "ta-IN",
        "course_of_interest": "Full-Stack Machine Learning & MLOps Engineering",
        "experience": "Final Year Engineering Student",
        "status": "hot",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=4)).isoformat(),
        "sentiment": "Interested",
        "score": 82,
    },
    {
        "id": "lead_003",
        "name": "Sneha Patel",
        "phone": "+919876543212",
        "email": "sneha.patel@outlook.com",
        "language": "en-IN",
        "course_of_interest": "Zero-to-Hero: Python, Mathematics & AI Foundations",
        "experience": "Business Analyst / Non-coder",
        "status": "warm",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=8)).isoformat(),
        "sentiment": "Inquiring",
        "score": 64,
    },
    {
        "id": "lead_004",
        "name": "Vikram Malhotra",
        "phone": "+919876543213",
        "email": "vikram.m@gmail.com",
        "language": "hi-IN",
        "course_of_interest": "Executive Masterclass in Generative AI & LLMs",
        "experience": "Tech Lead (8 yrs)",
        "status": "hot",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=12)).isoformat(),
        "sentiment": "Enthusiastic",
        "score": 92,
    },
    {
        "id": "lead_005",
        "name": "Meenakshi Raman",
        "phone": "+919876543214",
        "email": "meena.raman@gmail.com",
        "language": "ta-IN",
        "course_of_interest": "Full-Stack Machine Learning & MLOps Engineering",
        "experience": "Data Analyst (1 yr)",
        "status": "warm",
        "created_at": (datetime.now(timezone.utc) - timedelta(hours=18)).isoformat(),
        "sentiment": "Hesitant on Fees",
        "score": 58,
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Seed Demo Appointments
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INITIAL_APPOINTMENTS = [
    {
        "id": "appt_001",
        "lead_id": "lead_001",
        "lead_name": "Aarav Sharma",
        "phone": "+919876543210",
        "course_title": "Executive Masterclass in Generative AI & LLMs",
        "appointment_type": "1-on-1 AI Mentor Demo & Syllabus Review",
        "slot_date": (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d"),
        "slot_time": "04:30 PM",
        "counselor": "Dr. Rohit Verma (ex-Google AI)",
        "status": "confirmed",
        "notes": "Interested in LLM fine-tuning on AWS and EMI plans.",
        "created_at": _now_iso(),
    },
    {
        "id": "appt_002",
        "lead_id": "lead_002",
        "lead_name": "Karthik Sundaram",
        "phone": "+919876543211",
        "course_title": "Full-Stack Machine Learning & MLOps Engineering",
        "appointment_type": "Career Guidance & Placement Roadmap",
        "slot_date": (datetime.now(timezone.utc) + timedelta(days=2)).strftime("%Y-%m-%d"),
        "slot_time": "11:00 AM",
        "counselor": "Ananya Krishnan (Senior MLOps Lead)",
        "status": "confirmed",
        "notes": "College student seeking final-year placement assistance.",
        "created_at": _now_iso(),
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Seed Demo Calls & Summaries
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
INITIAL_CALLS = [
    {
        "id": "call_001",
        "lead_id": "lead_001",
        "lead_name": "Aarav Sharma",
        "phone": "+919876543210",
        "duration_seconds": 164,
        "language_used": "Hindi",
        "sentiment": "Enthusiastic",
        "lead_score": 88,
        "classification": "hot",
        "status": "completed",
        "summary": "Learner is very enthusiastic about building multi-agent LLM apps with LangGraph. Explained the 4-month curriculum, weekend timings, and 0% interest EMI of ₹3,750/mo. Booked 1-on-1 demo call with Dr. Verma.",
        "key_objection": "None",
        "recommended_action": "Conduct 1-on-1 demo call; offer 20% early bird voucher.",
        "started_at": (datetime.now(timezone.utc) - timedelta(minutes=45)).isoformat(),
    },
    {
        "id": "call_002",
        "lead_id": "lead_002",
        "lead_name": "Karthik Sundaram",
        "phone": "+919876543211",
        "duration_seconds": 210,
        "language_used": "Tamil",
        "sentiment": "Interested",
        "lead_score": 82,
        "classification": "hot",
        "status": "completed",
        "summary": "Karthik inquired in Tamil regarding placement support and MLOps projects. Clarified our 100% placement cell and 5 guaranteed interviews. Booked career guidance session.",
        "key_objection": "Placement Guarantee",
        "recommended_action": "Send verified alumni placement list and syllabus on WhatsApp.",
        "started_at": (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
    },
    {
        "id": "call_003",
        "lead_id": "lead_003",
        "lead_name": "Sneha Patel",
        "phone": "+919876543212",
        "duration_seconds": 120,
        "language_used": "English",
        "sentiment": "Hesitant on Coding",
        "lead_score": 64,
        "classification": "warm",
        "status": "completed",
        "summary": "Non-technical background, worried about calculus and coding. Reassured with the 4-week Zero-to-Hero Python & Math foundation module. Sent sample lecture video.",
        "key_objection": "No Coding Background",
        "recommended_action": "Follow up with invitation to upcoming Saturday free Python masterclass.",
        "started_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat(),
    },
]

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Master In-Memory Store
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
_store: dict[str, list[dict]] = {
    "courses": list(INITIAL_COURSES),
    "leads": list(INITIAL_LEADS),
    "appointments": list(INITIAL_APPOINTMENTS),
    "calls": list(INITIAL_CALLS),
    "call_events": [],
    "scores": [],
    "insights": [],
}


# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# CRUD Operations
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

async def db_insert(table: str, data: dict) -> dict:
    """Insert a row into the database table."""
    if "id" not in data:
        data["id"] = _new_id()
    if "created_at" not in data and "started_at" not in data and "queued_at" not in data:
        data["created_at"] = _now_iso()
    _store.setdefault(table, []).append(data)
    return data


async def db_select(
    table: str,
    filters: dict[str, Any] | None = None,
    order_by: str | None = None,
    order_desc: bool = True,
    limit: int | None = None,
) -> list[dict]:
    """Select rows with optional filtering, ordering, and limit."""
    rows = list(_store.get(table, []))
    if filters:
        for col, val in filters.items():
            rows = [r for r in rows if r.get(col) == val]
    if order_by:
        rows = sorted(rows, key=lambda r: str(r.get(order_by, "")), reverse=order_desc)
    if limit:
        rows = rows[:limit]
    return rows


async def db_update(table: str, row_id: str, data: dict) -> dict:
    """Update a row by ID."""
    rows = _store.get(table, [])
    for row in rows:
        if row.get("id") == row_id:
            row.update(data)
            return row
    return data


async def db_delete(table: str, row_id: str) -> bool:
    """Delete a row by ID."""
    rows = _store.get(table, [])
    before_len = len(rows)
    _store[table] = [r for r in rows if r.get("id") != row_id]
    return len(_store[table]) < before_len


async def db_count(table: str, filters: dict[str, Any] | None = None) -> int:
    """Count matching rows."""
    rows = await db_select(table, filters=filters)
    return len(rows)


def reset_database() -> None:
    """Cleanly reset the database to pure AI & ML course catalog and state."""
    global _store
    _store = {
        "courses": list(INITIAL_COURSES),
        "leads": list(INITIAL_LEADS),
        "appointments": list(INITIAL_APPOINTMENTS),
        "calls": list(INITIAL_CALLS),
        "call_events": [],
        "scores": [],
        "insights": [],
    }
    logger.info("Database reset to pure AI & ML course schema")
