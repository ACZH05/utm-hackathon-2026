from app.features.recommendation.schemas import (
    RecommendationRequest,
    RecommendationResponse,
)
from app.features.recommendation.service import generate_recommendation


def create_recommendation(
    request: RecommendationRequest,
) -> RecommendationResponse:
    recommendation = generate_recommendation(request)
    return RecommendationResponse(recommendation=recommendation)
