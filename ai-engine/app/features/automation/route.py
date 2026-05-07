from fastapi import APIRouter

from app.features.automation.controller import create_automation_recommendation
from app.features.automation.schemas import (
    AutomationRecommendationRequest,
    AutomationRecommendationResponse,
)

router = APIRouter()


@router.post(
    "/automation/recommend",
    response_model=AutomationRecommendationResponse,
    response_model_by_alias=True,
    tags=["automation"],
)
def automation_recommendation_route(
    payload: AutomationRecommendationRequest,
) -> AutomationRecommendationResponse:
    return create_automation_recommendation(payload)
