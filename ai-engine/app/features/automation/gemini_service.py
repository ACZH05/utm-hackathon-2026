from typing import Any

from app.core.gemini import generate_json_content
from app.features.automation.schemas import AutomationRecommendationRequest


def generate_automation_recommendation(
    request: AutomationRecommendationRequest,
    api_key: str,
    model_name: str,
) -> dict[str, Any]:
    prompt = (
        "You are generating immediately applicable automation settings for a "
        "vertical farming rack. Review the latest sensorReading against the "
        "plantProfile and return exactly one JSON object with keys cropName, "
        "ledStartTime, ledEndTime, ledSpectrum, fanTriggerTemperature, "
        "pumpIntervalMinutes, pumpDurationSeconds, confidence. "
        "Use only ledSpectrum values blue, red, white, or mixed. "
        "ledStartTime and ledEndTime must be HH:MM 24-hour strings. "
        "pumpIntervalMinutes and pumpDurationSeconds must be positive integers. "
        "Focus on practical settings for the next control cycle. "
        "Confidence must be a number between 0 and 1. "
        "No markdown or extra text."
    )
    return generate_json_content(
        request=request,
        prompt=prompt,
        api_key=api_key,
        model_name=model_name,
    )
