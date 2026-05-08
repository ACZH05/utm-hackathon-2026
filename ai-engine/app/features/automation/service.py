from app.core.gemini import generate_with_fallback
from app.features.automation import gemini_service
from app.features.automation.fallback_rules import (
    build_fallback_automation_recommendation,
)
from app.features.automation.schemas import (
    AIAutomationRecommendation,
    AutomationRecommendationRequest,
)


def generate_automation_recommendation(
    request: AutomationRecommendationRequest,
) -> AIAutomationRecommendation:
    return generate_with_fallback(
        request=request,
        response_model=AIAutomationRecommendation,
        fallback_factory=build_fallback_automation_recommendation,
        gemini_factory=gemini_service.generate_automation_recommendation,
        feature_name="automation recommendation",
    )
