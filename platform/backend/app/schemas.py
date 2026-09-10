from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class DominantEmotion(BaseModel):
    emotion: str
    probability: float


class ActiveEmotion(BaseModel):
    emotion: str
    probability: float
    threshold: float


class ReactionsSummary(BaseModel):
    counts: Dict[str, int]
    total: int


class AnalyzeRequest(BaseModel):
    post_id: Optional[str] = None
    comments: List[str] = Field(default_factory=list)
    reactions: Dict[str, Any] = Field(default_factory=dict)  # Post's 7 reaction counts
    post_text: Optional[str] = None  # Accepted for backwards-compatibility, but strictly ignored


class AnalyzeResponse(BaseModel):
    post_id: Optional[str] = None
    dataset_version: str = "emotion_22_v2"
    status: str = "success"
    message: Optional[str] = None
    text_source: str = "post_comments_only"
    comments_analyzed: int = 0
    sentiment: str = "neutral"
    confidence: float = 0.0
    positive_score: float = 0.0
    negative_score: float = 0.0
    dominant_emotions: List[DominantEmotion] = Field(default_factory=list)
    active_emotions: List[ActiveEmotion] = Field(default_factory=list)
    reason: str = ""
    all_emotions: Dict[str, float] = Field(default_factory=dict)
    reactions_summary: ReactionsSummary
