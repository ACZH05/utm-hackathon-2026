from typing import Literal

from pydantic import Field

from app.features.shared.schemas import CamelModel, DecisionRequest

class Recommendation(CamelModel):
    title: str
    message: str
    suggested_action: str
    severity: Literal["info", "warning", "critical"]
    confidence: float = Field(ge=0.0, le=1.0)


RecommendationRequest = DecisionRequest


class RecommendationResponse(CamelModel):
    recommendation: Recommendation
