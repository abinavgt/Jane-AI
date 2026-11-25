"""
Per-lead memory service for Rise AI Academy.
Stores conversation history, objections, rebuttals, and qualification
across counseling sessions for each student.
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger("riseagent.memory")

# In-memory store of past calls and notes per lead
_lead_memories: dict[str, list[dict]] = {}


async def store_call_memory(
    lead_id: str,
    call_number: int,
    language_detected: str,
    objections_raised: list[str],
    rebuttals_used: list[str],
    interest_signals: list[str],
    conversation_summary: str,
    classification: str,
) -> None:
    """Store student interaction memory."""
    memory_doc = {
        "lead_id": lead_id,
        "call_number": call_number,
        "language_detected": language_detected,
        "objections_raised": objections_raised,
        "rebuttals_used": rebuttals_used,
        "interest_signals": interest_signals,
        "conversation_summary": conversation_summary,
        "classification": classification,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    _lead_memories.setdefault(lead_id, []).append(memory_doc)
    logger.info("Stored memory for lead %s, call #%d [%s]", lead_id, call_number, classification)


async def retrieve_lead_memory(lead_id: str, last_n: int = 2) -> str:
    """Retrieve formatted past interaction history for a lead."""
    mems = _lead_memories.get(lead_id, [])
    if not mems:
        return "New prospective student. No prior counseling interactions."

    recent = mems[-last_n:]
    lines = []
    for m in recent:
        lines.append(
            f"Call #{m['call_number']}: Language={m['language_detected']}, "
            f"Classification={m['classification']}. Summary: {m['conversation_summary']}"
        )
    return "\n".join(lines)


async def get_call_count(lead_id: str) -> int:
    """Return number of counseling calls conducted with this lead."""
    return len(_lead_memories.get(lead_id, []))
