"""
WhatsApp Meta Cloud API integration for AI & ML Course brochure follow-ups.
"""

from __future__ import annotations

import logging
import httpx
from config import get_settings

logger = logging.getLogger("riseagent.whatsapp")


async def send_followup_whatsapp(
    phone: str,
    lead_name: str,
    course_name: str = "Executive Masterclass in Generative AI",
    syllabus_link: str = "https://riseai.academy/syllabus",
) -> dict:
    """Send automated course brochure & 1-on-1 demo invitation via WhatsApp."""
    settings = get_settings()

    if not settings.whatsapp_token or not settings.whatsapp_phone_number_id:
        logger.info(
            "WhatsApp simulation: sent AI course syllabus to %s (%s) for %s",
            lead_name, phone, course_name,
        )
        return {
            "status": "simulated",
            "phone": phone,
            "message": f"Hi {lead_name}, here is your syllabus and scholarship link for {course_name}: {syllabus_link}",
        }

    url = f"https://graph.facebook.com/v18.0/{settings.whatsapp_phone_number_id}/messages"
    headers = {
        "Authorization": f"Bearer {settings.whatsapp_token}",
        "Content-Type": "application/json",
    }
    payload = {
        "messaging_product": "whatsapp",
        "to": phone,
        "type": "text",
        "text": {
            "body": (
                f"Hi {lead_name}! Thank you for your interest in Rise AI Academy's {course_name}. "
                f"Download your complete course curriculum here: {syllabus_link}. "
                f"Reply to this message if you would like to book a 1-on-1 demo session with our AI mentors!"
            )
        },
    }

    try:
        async with httpx.AsyncClient(timeout=15.0) as client:
            resp = await client.post(url, json=payload, headers=headers)
            resp.raise_for_status()
            return resp.json()
    except Exception as exc:
        logger.error("WhatsApp message send failed: %s", exc)
        return {"status": "failed", "error": str(exc)}
