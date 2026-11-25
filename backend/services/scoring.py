"""
Lead scoring engine for Rise AI Academy.
Scores student leads based on conversational intent, sentiment,
course interest, background readiness, and objection signals.
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger("riseagent.scoring")


async def score_course_lead(
    transcript: str,
    sentiment: str = "Interested",
    duration_seconds: int = 60,
    objection_count: int = 0,
) -> dict:
    """
    Score a student lead out of 100 and classify as Hot / Warm / Cold.
    """
    transcript_lower = transcript.lower()

    # 1. Verbal Intent Points (up to 40)
    intent_keywords = [
        "enroll", "admission", "register", "join", "interested", "demo",
        "book", "curriculum", "syllabus", "mentor", "start", "pay", "scholarship",
        "padhna", "seekhna", "aasa", "seri", "kandippa",
    ]
    intent_hits = sum(1 for kw in intent_keywords if kw in transcript_lower)
    intent_points = min(intent_hits * 10, 40)

    # 2. Duration Engagement Points (up to 20)
    if duration_seconds > 120:
        duration_points = 20
    elif duration_seconds > 45:
        duration_points = 12
    else:
        duration_points = 5

    # 3. Sentiment Points (up to 25)
    sentiment_points = 15
    if sentiment in ["Enthusiastic", "Interested"]:
        sentiment_points = 25
    elif sentiment in ["Inquiring", "Neutral"]:
        sentiment_points = 15
    elif "Hesitant" in sentiment:
        sentiment_points = 10
    elif sentiment == "Disengaged":
        sentiment_points = 0

    # 4. Objection Impact
    # If objections were answered, they show high consideration
    objection_points = min(objection_count * 5, 15)

    total_score = min(max(intent_points + duration_points + sentiment_points + objection_points, 15), 100)

    # Classification
    if total_score >= 75:
        classification = "hot"
        recommended_action = "Priority Admission Callback & Demo Confirmation"
    elif total_score >= 50:
        classification = "warm"
        recommended_action = "Send Syllabus Brochure & Scholarship Test Link on WhatsApp"
    else:
        classification = "cold"
        recommended_action = "Nurture with Weekly AI Tech Newsletter & Free Webinar Invite"

    return {
        "total_score": total_score,
        "classification": classification,
        "sentiment": sentiment,
        "recommended_action": recommended_action,
        "breakdown": {
            "intent_points": intent_points,
            "duration_points": duration_points,
            "sentiment_points": sentiment_points,
            "objection_points": objection_points,
        },
    }
