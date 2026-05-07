from app.core.gemini import generate_with_fallback
from app.features.recommendation import gemini_service
from app.features.recommendation.fallback_rules import build_fallback_recommendation
from app.features.recommendation.schemas import Recommendation, RecommendationRequest


def generate_recommendation(request: RecommendationRequest) -> Recommendation:
    return generate_with_fallback(
        request=request,
        response_model=Recommendation,
        fallback_factory=build_fallback_recommendation,
        gemini_factory=gemini_service.generate_recommendation,
        feature_name="recommendation",
    )
