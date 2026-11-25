"""
RiseAgent AI — AI & ML Course Sales & Counseling Voice Agent.
FastAPI application entry point.
"""

from __future__ import annotations

import logging
import sys

from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import leads, calls, webhooks, dashboard, voice

# ── Logging ──────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-25s | %(levelname)-5s | %(message)s",
    stream=sys.stdout,
)
logger = logging.getLogger("riseagent")

settings = get_settings()

# ── FastAPI app ──────────────────────────────────────────────────
app = FastAPI(
    title="Jane AI — AI & ML Course Voice Counseling Agent",
    description=(
        "Intelligent real-time voice counseling and sales agent "
        "for selling AI, Machine Learning, and Generative AI courses "
        "in Hindi, Tamil, and English."
    ),
    version="2.0.0",
)

# ── CORS ─────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Mount routers ────────────────────────────────────────────────
app.include_router(voice.router)
app.include_router(leads.router)
app.include_router(calls.router)
app.include_router(dashboard.router)
app.include_router(webhooks.router)


# ── Health check ─────────────────────────────────────────────────
@app.get("/")
async def root():
    return {
        "service": "Jane AI — AI & ML Course Sales Agent",
        "version": "2.0.0",
        "theme": "Selling AI and ML Courses",
        "supported_languages": ["English", "Hindi", "Tamil"],
        "features": [
            "Real-time voice interaction with STT and TTS",
            "Contextual memory and multilingual communication",
            "Intelligent lead qualification and sentiment analysis",
            "RAG-based knowledge retrieval",
            "Automated appointment booking and CRM integration",
            "Call summarisation and business insights",
        ],
        "status": "operational",
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "service": "Jane AI",
        "supported_languages": ["en-IN", "hi-IN", "ta-IN"],
    }


# ── Startup event ────────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    logger.info("=" * 60)
    logger.info("RiseAgent AI (AI & ML Course Sales) starting up")
    logger.info("Supported Languages: English, Hindi, Tamil")
    logger.info("=" * 60)

    # Pre-load knowledge base
    try:
        from knowledge.loader import load_knowledge_base
        load_knowledge_base()
        logger.info("AI & ML courses knowledge base loaded successfully")
    except Exception as exc:
        logger.warning("Knowledge base initialization note: %s", exc)
