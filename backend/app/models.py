from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field

Platform = Literal['WhatsApp', 'Instagram', 'Email', 'SMS']
ThreatLevel = Literal['Safe', 'Suspicious', 'Threat']


class AnalysisRequest(BaseModel):
    message: str = Field(..., min_length=1)
    platform: Platform = 'SMS'
    sender: str = 'User Input'


class StreamRequest(BaseModel):
    message: str | None = None
    platform: Platform | None = None
    sender: str | None = None


class ThreatRecord(BaseModel):
    id: str
    message: str
    platform: Platform
    sender: str
    risk_level: ThreatLevel
    confidence: float
    timestamp: datetime
    explanation: str
    source: str = 'backend'


class ModelPayload(BaseModel):
    dataset_size: int
    keyword_rules: list[str]
    generated_at: datetime