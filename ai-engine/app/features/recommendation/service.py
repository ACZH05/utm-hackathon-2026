import logging

from app.core.config import get_settings
from app.features.recommendation import gemini_service
from app.features.recommendation.fallback_rules import build_fallback_recommendation
from app.features.recommendation.schemas import Recommendation, RecommendationRequest

logger = logging.getLogger(__name__)


def generate_recommendation(request: RecommendationRequest) -> Recommendation:
    settings = get_settings()

    if not settings.gemini_api_key:
        return build_fallback_recommendation(request)

    try:
        gemini_payload = gemini_service.generate_recommendation(
            request=request,
            api_key=settings.gemini_api_key,
            model_name=settings.gemini_model,
        )
        return Recommendation.model_validate(gemini_payload)
    except Exception as exc:
        logger.warning(
            "Falling back to rule-based recommendation after Gemini failure "
            "(model=%s): %s",
            settings.gemini_model,
            exc,
        )
        return build_fallback_recommendation(request)
