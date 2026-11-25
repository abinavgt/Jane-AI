"""
Objection handling and rebuttal retrieval service for AI & ML Courses.
Matches student hesitations and returns targeted counseling rebuttals.
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger("riseagent.objection_handler")

# Objection categories and trigger keywords for AI courses
OBJECTION_TRIGGERS = {
    "no_coding_background": [
        "coding", "non-tech", "beginner", "arts", "commerce", "mechanical",
        "never coded", "coding theriyadhu", "math", "hard", "zero experience",
    ],
    "course_fee_high": [
        "fee", "fees", "cost", "expensive", "cannot afford", "price",
        "emi", "scholarship", "discount", "panam", "budget",
    ],
    "time_commitment_busy": [
        "time", "busy", "working", "job", "schedule", "exams",
        "full time", "hours", "timing", "weekdays",
    ],
    "placement_doubt": [
        "placement", "job", "guarantee", "salary", "companies",
        "hiring", "naukri", "velai", "fake", "interview calls",
    ],
    "self_learning_youtube": [
        "youtube", "free", "coursera", "udemy", "self learn",
        "internet", "tutorials",
    ],
}

COURSE_REBUTTALS = {
    "no_coding_background": (
        "Over 40% of our successful alumni come from non-tech backgrounds (such as commerce, mechanical, marketing). "
        "We provide a 4-week Zero-to-Hero Python & Mathematics foundation module at no extra cost, plus 1-on-1 mentor guidance."
    ),
    "course_fee_high": (
        "We offer 0% interest monthly EMI starting at just ₹3,750/month with zero down payment, "
        "and up to 30% merit scholarship via our 15-minute online AI assessment. With average starting packages of ₹12+ LPA, the ROI is rapid."
    ),
    "time_commitment_busy": (
        "Live interactive classes happen exclusively on Saturdays and Sundays (3 hours each). "
        "All sessions are recorded in 4K HD with lifetime portal access, requiring only 5-6 hours a week at your own pace."
    ),
    "placement_doubt": (
        "We offer dedicated 100% placement support with 5 guaranteed interview opportunities with 350+ hiring partners "
        "(including Google, Microsoft, Amazon, Swiggy, and top AI startups), along with resume re-engineering and mock interviews."
    ),
    "self_learning_youtube": (
        "Free tutorials don't provide dedicated cloud GPU server credits, enterprise capstone code reviews from Senior AI Engineers, "
        "or direct placement referral pipelines that fast-track your hiring."
    ),
}


class ObjectionTracker:
    """Tracks objections raised during a student counseling session."""

    def __init__(self):
        self.raised_objections: list[str] = []
        self.used_rebuttals: list[str] = []

    def classify_and_respond(self, text: str) -> tuple[Optional[str], Optional[str]]:
        """Identify if an objection is raised and return rebuttal."""
        text_lower = text.lower()
        for category, triggers in OBJECTION_TRIGGERS.items():
            if any(trig in text_lower for trig in triggers):
                if category not in self.raised_objections:
                    self.raised_objections.append(category)
                    rebuttal = COURSE_REBUTTALS.get(category, "")
                    self.used_rebuttals.append(rebuttal)
                    return category, rebuttal
        return None, None


def classify_objection(text: str) -> str:
    """Classify student statement into objection category."""
    text_lower = text.lower()
    for cat, triggers in OBJECTION_TRIGGERS.items():
        if any(t in text_lower for t in triggers):
            return cat
    return "none"


def get_rebuttal(objection_type: str) -> str:
    """Get standard rebuttal for objection type."""
    return COURSE_REBUTTALS.get(objection_type, "Our academic counselors are here to help you evaluate the best learning path.")
