from fastapi import APIRouter

from app.features.recommendation.controller import create_recommendation
from app.features.recommendation.schemas import (
    RecommendationRequest,
    RecommendationResponse,
)

router = APIRouter()


@router.post(
    "/recommendation",
    response_model=RecommendationResponse,
    response_model_by_alias=True,
    tags=["recommendation"],
)
def recommendation_route(
    payload: RecommendationRequest,
) -> RecommendationResponse:
    return create_recommendation(payload)
