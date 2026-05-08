from app.features.automation.schemas import (
    AutomationRecommendationRequest,
    AutomationRecommendationResponse,
)
from app.features.automation.service import generate_automation_recommendation


def create_automation_recommendation(
    request: AutomationRecommendationRequest,
) -> AutomationRecommendationResponse:
    ai_automation_recommendation = generate_automation_recommendation(request)
    return AutomationRecommendationResponse(
        ai_automation_recommendation=ai_automation_recommendation,
    )
