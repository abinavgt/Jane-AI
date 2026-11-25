"""Lead Pydantic models for AI & ML Courses."""

from __future__ import annotations

from typing import Optional
from pydantic import BaseModel, Field


class LeadCreate(BaseModel):
    """Payload for POST /leads/new."""
    name: str = Field(..., min_length=1, max_length=200, description="Lead's full name")
    phone: str = Field(..., pattern=r"^\+?\d{10,15}$", description="Phone number with optional country code")
    email: Optional[str] = None
    course_of_interest: Optional[str] = "Executive Masterclass in Generative AI & LLMs"
    language_hint: Optional[str] = Field(default="en-IN", description="Optional language hint e.g. en-IN, hi-IN, ta-IN")
    source: Optional[str] = Field(default="website_inquiry", description="Lead source")


class LeadResponse(BaseModel):
    """Lead as returned from API."""
    id: str
    name: str
    phone: str
    email: Optional[str] = None
    course_of_interest: Optional[str] = "Executive Masterclass in Generative AI & LLMs"
    language: str = "en-IN"
    source: Optional[str] = None
    status: str = "pending"
    sentiment: Optional[str] = "Interested"
    score: Optional[int] = 75
    created_at: Optional[str] = None


class LeadListResponse(BaseModel):
    """Paginated lead list."""
    leads: list[LeadResponse]
    total: int
