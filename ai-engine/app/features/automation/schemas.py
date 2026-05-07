from typing import Annotated, Literal

from pydantic import Field, StringConstraints

from app.features.shared.schemas import CamelModel, DecisionRequest

TimeString = Annotated[
    str,
    StringConstraints(pattern=r"^(?:[01]\d|2[0-3]):[0-5]\d$"),
]
LedSpectrum = Literal["blue", "red", "white", "mixed"]
AutomationRecommendationRequest = DecisionRequest


class AIAutomationRecommendation(CamelModel):
    crop_name: str = Field(min_length=1)
    led_start_time: TimeString
    led_end_time: TimeString
    led_spectrum: LedSpectrum
    fan_trigger_temperature: float
    pump_interval_minutes: int = Field(gt=0)
    pump_duration_seconds: int = Field(gt=0)
    confidence: float = Field(ge=0.0, le=1.0)


class AutomationRecommendationResponse(CamelModel):
    ai_automation_recommendation: AIAutomationRecommendation
