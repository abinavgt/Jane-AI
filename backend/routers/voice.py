"""
Voice Router — Real-time Speech Interaction, STT/TTS integration,
Multilingual Processing (Hindi, Tamil, English), Sentiment Analysis,
and Automated CRM Appointment Booking.
"""

from __future__ import annotations

import io
import logging
from typing import Optional
try:
    import speech_recognition as sr
except ImportError:
    sr = None
from pydantic import BaseModel, Field
from fastapi import APIRouter, HTTPException, UploadFile, File, Form

from services.conversation import get_or_create_session, ConversationSession
from services.language import get_language_code, get_language_name
from database import db_insert, db_select

logger = logging.getLogger("riseagent.routers.voice")
router = APIRouter(prefix="/voice", tags=["voice"])


class VoiceInteractRequest(BaseModel):
    user_text: str = Field(..., description="Transcribed speech from microphone or chat text")
    language: str = Field(default="en-IN", description="Language code: en-IN, hi-IN, or ta-IN")
    session_id: Optional[str] = Field(default=None, description="Unique session ID for multi-turn memory")
    lead_name: Optional[str] = Field(default="Learner", description="Lead/Student name")
    phone: Optional[str] = Field(default="+919876543210", description="Phone number")
    course_title: Optional[str] = Field(default=None, description="Optional target course")


class AppointmentBookingRequest(BaseModel):
    lead_name: str
    phone: str
    course_title: str
    slot_date: str
    slot_time: str
    notes: Optional[str] = ""


@router.post("/chat")
async def voice_chat_endpoint(payload: VoiceInteractRequest):
    """
    Core real-time voice interaction endpoint.
    Takes user speech transcript, performs RAG retrieval on AI courses,
    maintains contextual memory, detects sentiment, and auto-books demo appointments.
    """
    if not payload.user_text.strip():
        raise HTTPException(status_code=400, detail="Empty speech input")

    session = get_or_create_session(
        session_id=payload.session_id,
        lead_name=payload.lead_name or "Learner",
        phone=payload.phone or "+919876543210",
        language=payload.language,
    )
    if payload.course_title:
        session.target_course = payload.course_title

    result = await session.process_student_speech(payload.user_text)

    # Log to calls/events in database
    await db_insert("call_events", {
        "call_id": session.session_id,
        "turn_number": session.turn_count,
        "speaker": "user",
        "text": payload.user_text,
        "sentiment": result["sentiment"],
    })
    await db_insert("call_events", {
        "call_id": session.session_id,
        "turn_number": session.turn_count,
        "speaker": "ai",
        "text": result["reply_text"],
        "sentiment": result["sentiment"],
    })

    return {
        "session_id": result["session_id"],
        "reply_text": result["reply_text"],
        "language": result["language"],
        "language_name": result["language_name"],
        "sentiment": result["sentiment"],
        "qualification_score": result["qualification_score"],
        "appointment_booked": result["appointment_booked"],
        "booking_details": result["booking_details"],
        "turn_count": result["turn_count"],
    }


@router.post("/book-appointment")
async def book_appointment_endpoint(payload: AppointmentBookingRequest):
    """Directly book a 1-on-1 counseling demo appointment in the CRM."""
    data = {
        "lead_name": payload.lead_name,
        "phone": payload.phone,
        "course_title": payload.course_title,
        "appointment_type": "1-on-1 AI Mentor Demo & Syllabus Review",
        "slot_date": payload.slot_date,
        "slot_time": payload.slot_time,
        "counselor": "Dr. Rohit Verma (ex-Google AI)",
        "status": "confirmed",
        "notes": payload.notes or "Booked via dashboard voice interaction",
    }
    created = await db_insert("appointments", data)
    return {"success": True, "appointment": created}


@router.post("/transcribe")
async def transcribe_audio_endpoint(
    audio: UploadFile = File(...),
    language: str = Form("en-IN"),
):
    """
    Transcribe microphone audio recorded directly in the browser.
    Uses Python SpeechRecognition with multi-language fallback.
    """
    if sr is None:
        return {"transcript": "", "success": False, "error": "SpeechRecognition package not installed."}
    r = sr.Recognizer()
    r.energy_threshold = 300
    r.dynamic_energy_threshold = True

    audio_bytes = await audio.read()

    if not audio_bytes or len(audio_bytes) < 100:
        return {"transcript": "", "success": False, "error": "Recording was too short or empty."}

    logger.info("Received audio upload for transcription: %d bytes, requested lang: %s", len(audio_bytes), language)

    try:
        with io.BytesIO(audio_bytes) as audio_file:
            with sr.AudioFile(audio_file) as source:
                audio_data = r.record(source)
                
                # Primary attempt with requested language
                langs_to_try = [language]
                if language not in ("en-IN", "en-US"):
                    langs_to_try.extend(["en-IN", "en-US"])
                else:
                    langs_to_try.extend(["en-IN", "en-US", "hi-IN"])

                for lang_code in langs_to_try:
                    try:
                        transcript = r.recognize_google(audio_data, language=lang_code)
                        if transcript and transcript.strip():
                            logger.info("Transcribed audio successfully with '%s': %s", lang_code, transcript)
                            return {"transcript": transcript.strip(), "success": True, "detected_lang": lang_code}
                    except sr.UnknownValueError:
                        continue
                    except sr.RequestError as req_err:
                        logger.warning("Google Speech request error for %s: %s", lang_code, req_err)
                        break

                return {
                    "transcript": "",
                    "success": False,
                    "error": "Could not recognize speech. Please speak clearly into your mic and try again."
                }
    except Exception as exc:
        logger.warning("Audio transcription processing exception: %s", exc)
        return {"transcript": "", "success": False, "error": f"Audio processing error: {str(exc)}"}


