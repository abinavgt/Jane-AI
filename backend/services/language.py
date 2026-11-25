"""
Language detection, normalization, and switching service.
Supports Hindi (hi-IN), Tamil (ta-IN), and English (en-IN).
"""

from __future__ import annotations

import logging
from typing import Optional

logger = logging.getLogger("riseagent.language")

SUPPORTED_LANGUAGES = {
    "en-IN": "English",
    "hi-IN": "Hindi",
    "ta-IN": "Tamil",
}

NAME_TO_CODE = {
    "english": "en-IN",
    "hindi": "hi-IN",
    "tamil": "ta-IN",
    "en": "en-IN",
    "hi": "hi-IN",
    "ta": "ta-IN",
    "en-in": "en-IN",
    "hi-in": "hi-IN",
    "ta-in": "ta-IN",
    "hinglish": "hi-IN",
    "tanglish": "ta-IN",
}


def get_language_code(hint: Optional[str]) -> str:
    """Normalize any language name or code to one of en-IN, hi-IN, ta-IN."""
    if not hint:
        return "en-IN"
    cleaned = hint.strip().lower()
    return NAME_TO_CODE.get(cleaned, "en-IN")


def get_language_name(code: str) -> str:
    """Return human readable language name."""
    norm_code = get_language_code(code)
    return SUPPORTED_LANGUAGES.get(norm_code, "English")


class LanguageState:
    """Tracks conversation language and code-switching for a student session."""

    def __init__(self, initial_hint: Optional[str] = "en-IN"):
        self.current_language: str = get_language_code(initial_hint)
        self.history: list[str] = [self.current_language]

    @property
    def language_name(self) -> str:
        return get_language_name(self.current_language)

    def detect_and_update(self, text: str) -> bool:
        """Detect language from text and switch if appropriate."""
        detected = detect_simple_language(text)
        if detected and detected != self.current_language:
            logger.info("Language switch detected: %s -> %s", self.current_language, detected)
            self.current_language = detected
            self.history.append(detected)
            return True
        return False


def detect_simple_language(text: str) -> str:
    """
    Detect whether text is Hindi, Tamil, or English based on script/keywords.
    """
    if not text:
        return "en-IN"

    # Unicode ranges: Devanagari (Hindi) is 0900-097F, Tamil is 0B80-0BFF
    has_devanagari = any("\u0900" <= ch <= "\u097F" for ch in text)
    if has_devanagari:
        return "hi-IN"

    has_tamil = any("\u0B80" <= ch <= "\u0BFF" for ch in text)
    if has_tamil:
        return "ta-IN"

    text_lower = text.lower()

    # Common Romanized Tamil (Tanglish) indicators
    tamil_words = [
        "vanakkam", "solla", "mudiyuma", "romba", "nalla", "eppadi",
        "seri", "enakku", "padikka", "aasa", "theriyum", "theriyadhu",
        "fees", "engalukku", "kudupingala", "kandippa", "neenga",
    ]
    if any(w in text_lower.split() for w in tamil_words):
        return "ta-IN"

    # Common Romanized Hindi (Hinglish) indicators
    hindi_words = [
        "namaste", "haan", "kaise", "kya", "mujhe", "batao", "karna", "hai",
        "theek", "accha", "samajh", "aaya", "kitna", "fees", "kitni", "milega",
        "padhna", "chahata", "chahati", "shuru", "hoga", "seekh", "sakta",
    ]
    if any(w in text_lower.split() for w in hindi_words):
        return "hi-IN"

    return "en-IN"
