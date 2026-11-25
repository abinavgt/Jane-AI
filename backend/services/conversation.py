"""
Conversation engine for Rise AI Academy.
Manages multi-turn student counseling, RAG knowledge retrieval,
sentiment analysis, multilingual processing (Hindi, Tamil, English),
and automated demo appointment scheduling.
"""

from __future__ import annotations

import logging
import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any

from services.llm import get_llm_response
from services.language import get_language_name, get_language_code, LanguageState
from knowledge.loader import retrieve_relevant_knowledge
from prompts.system_prompt import (
    build_course_system_prompt,
    build_call_summary_prompt,
)
from database import db_insert, db_select, db_update

logger = logging.getLogger("riseagent.conversation")

# In-memory active sessions dictionary
_active_sessions: dict[str, ConversationSession] = {}


class ConversationSession:
    """Manages a live multi-turn counseling interaction with a student/lead."""

    def __init__(
        self,
        session_id: str,
        lead_id: Optional[str] = None,
        lead_name: str = "Learner",
        phone: str = "",
        language: str = "en-IN",
    ):
        self.session_id = session_id
        self.lead_id = lead_id or f"lead_{uuid.uuid4().hex[:8]}"
        self.lead_name = lead_name
        self.phone = phone
        self.language_code = get_language_code(language)
        self.language_state = LanguageState(self.language_code)
        self.turn_count = 0
        self.transcript: list[dict] = []
        self.detected_sentiment = "Inquiring"
        self.qualification_score = 65
        self.target_course = "Executive Masterclass in Generative AI & LLMs"
        self.appointment_booked = False
        self.created_at = datetime.now(timezone.utc).isoformat()

    def get_context_memory_str(self) -> str:
        """Summarize conversation history as concise context memory."""
        if not self.transcript:
            return "First turn. No prior questions."
        summary_lines = []
        for turn in self.transcript[-6:]:
            speaker = "Student" if turn["speaker"] == "user" else "Counselor"
            summary_lines.append(f"{speaker}: {turn['text']}")
        return "\n".join(summary_lines)

    async def process_student_speech(self, user_text: str) -> dict:
        """
        Process a student's spoken/text message, run RAG retrieval,
        update sentiment, auto-book appointments if requested, and return response.
        """
        self.turn_count += 1
        clean_text = user_text.strip()

        # 1. Update language state if code-switching or different language spoken
        self.language_state.detect_and_update(clean_text)
        current_lang_name = self.language_state.language_name

        # 2. Retrieve relevant course knowledge chunks (RAG)
        retrieved_knowledge = retrieve_relevant_knowledge(clean_text, k=3)

        # 3. Build system prompt with contextual memory & retrieved knowledge
        context_memory = self.get_context_memory_str()
        system_prompt = build_course_system_prompt(
            detected_language=current_lang_name,
            student_name=self.lead_name,
            context_memory=context_memory,
            retrieved_knowledge=retrieved_knowledge,
        )

        # 4. Generate AI response
        ai_resp = await get_llm_response(
            system_prompt=system_prompt,
            user_message=clean_text,
            call_id=self.session_id,
        )
        reply_text = ai_resp.get("text", "").strip()
        provider = ai_resp.get("provider", "rise_counselor")

        # 5. Sentiment analysis & intent classification
        sentiment, score, is_booking_request = self._analyze_intent_and_sentiment(clean_text)
        self.detected_sentiment = sentiment
        self.qualification_score = max(self.qualification_score, score)

        # 6. Automated Appointment Booking if triggered
        booking_info = None
        if is_booking_request and not self.appointment_booked:
            booking_info = await self._book_appointment()
            self.appointment_booked = True

        # 7. Record turns in transcript
        self.transcript.append({
            "turn": self.turn_count * 2 - 1,
            "speaker": "user",
            "text": clean_text,
            "sentiment": sentiment,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })
        self.transcript.append({
            "turn": self.turn_count * 2,
            "speaker": "ai",
            "text": reply_text,
            "provider": provider,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        })

        return {
            "session_id": self.session_id,
            "lead_id": self.lead_id,
            "reply_text": reply_text,
            "language": self.language_state.current_language,
            "language_name": current_lang_name,
            "sentiment": self.detected_sentiment,
            "qualification_score": self.qualification_score,
            "appointment_booked": self.appointment_booked,
            "booking_details": booking_info,
            "turn_count": self.turn_count,
        }

    def _analyze_intent_and_sentiment(self, text: str) -> tuple[str, int, bool]:
        """Classify sentiment, qualification score, and appointment booking trigger."""
        txt = text.lower()
        score = 65
        sentiment = "Interested"
        is_booking = False

        # Check for booking intention
        booking_words = ["book", "demo", "appointment", "schedule", "counselor", "call me", "talk to", "seshan", "slot"]
        if any(w in txt for w in booking_words):
            is_booking = True
            sentiment = "Enthusiastic"
            score = 90

        # High interest / enrollment
        elif any(w in txt for w in ["join", "enroll", "admission", "register", "start", "sign me up", "ready", "interested"]):
            sentiment = "Enthusiastic"
            score = 85

        # Objections / Hesitations
        elif any(w in txt for w in ["expensive", "cost", "fees", "discount", "scholarship", "emi", "panam"]):
            sentiment = "Hesitant on Fees"
            score = 60

        elif any(w in txt for w in ["coding", "non-tech", "beginner", "arts", "commerce", "math", "hard", "theriyadhu"]):
            sentiment = "Hesitant on Coding"
            score = 65

        elif any(w in txt for w in ["time", "busy", "work", "job", "schedule", "exam"]):
            sentiment = "Time Constraint"
            score = 62

        elif any(w in txt for w in ["placement", "job", "guarantee", "salary", "companies"]):
            sentiment = "Inquiring Placement"
            score = 75

        return sentiment, score, is_booking

    async def _book_appointment(self) -> dict:
        """Auto-create a 1-on-1 AI Mentor Demo booking in CRM."""
        appt_date = (datetime.now(timezone.utc) + timedelta(days=1)).strftime("%Y-%m-%d")
        appt_data = {
            "lead_id": self.lead_id,
            "lead_name": self.lead_name,
            "phone": self.phone or "+919876543210",
            "course_title": self.target_course,
            "appointment_type": "1-on-1 AI Mentor Demo & Syllabus Review",
            "slot_date": appt_date,
            "slot_time": "04:30 PM",
            "counselor": "Dr. Rohit Verma (ex-Google AI)",
            "status": "confirmed",
            "notes": f"Booked via Voice Agent. Sentiment: {self.detected_sentiment}. Score: {self.qualification_score}",
            "created_at": datetime.now(timezone.utc).isoformat(),
        }
        record = await db_insert("appointments", appt_data)
        logger.info("Automated appointment booked for %s: %s", self.lead_name, record.get("id"))
        return record


def get_or_create_session(
    session_id: Optional[str] = None,
    lead_id: Optional[str] = None,
    lead_name: str = "Learner",
    phone: str = "",
    language: str = "en-IN",
) -> ConversationSession:
    """Retrieve existing conversation session or initialize a new one."""
    s_id = session_id or str(uuid.uuid4())
    if s_id not in _active_sessions:
        _active_sessions[s_id] = ConversationSession(
            session_id=s_id,
            lead_id=lead_id,
            lead_name=lead_name,
            phone=phone,
            language=language,
        )
    return _active_sessions[s_id]


async def generate_call_summary(transcript_text: str) -> dict:
    """Generate business summary, objection extraction, and next steps."""
    if not transcript_text:
        return {
            "summary": "Short inquiry regarding AI & ML course offerings.",
            "sentiment": "Neutral",
            "key_objection": "None",
            "recommended_action": "Follow up with course brochure on WhatsApp.",
        }

    prompt = build_call_summary_prompt(transcript_text)
    resp = await get_llm_response(
        system_prompt="You are an expert AI educational admissions summarizer.",
        user_message=prompt,
    )
    summary_text = resp.get("text", "Student interested in AI & ML courses.").strip()

    # Determine key objection
    txt_lower = transcript_text.lower()
    objection = "None"
    if "fee" in txt_lower or "cost" in txt_lower or "expensive" in txt_lower:
        objection = "Course Fee / EMI"
    elif "coding" in txt_lower or "non-tech" in txt_lower:
        objection = "No Coding Background"
    elif "placement" in txt_lower or "job" in txt_lower:
        objection = "Placement Guarantee"
    elif "time" in txt_lower or "busy" in txt_lower:
        objection = "Weekend Schedule"

    return {
        "summary": summary_text,
        "key_objection": objection,
        "recommended_action": "Schedule 1-on-1 counseling demo and provide 20% early-bird scholarship.",
    }
