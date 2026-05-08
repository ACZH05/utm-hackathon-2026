from typing import Any

from app.core.gemini import generate_json_content
from app.features.recommendation.schemas import RecommendationRequest


def generate_recommendation(
    request: RecommendationRequest,
    api_key: str,
    model_name: str,
) -> dict[str, Any]:
    prompt = (
        "You are generating an immediate control-action recommendation for a "
        "vertical farming rack. Review the latest sensorReading against the "
        "plantProfile and return exactly one JSON object with keys "
        "title, message, suggestedAction, severity, confidence. "
        "Focus on the single most important immediate control action. "
        "Use concise operational language. "
        "Severity must be info, warning, or critical. "
        "Confidence must be a number between 0 and 1. "
        "No markdown or extra text."
    )
    return generate_json_content(
        request=request,
        prompt=prompt,
        api_key=api_key,
        model_name=model_name,
    )
