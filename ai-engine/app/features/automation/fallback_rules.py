from app.features.automation.schemas import (
    AIAutomationRecommendation,
    AutomationRecommendationRequest,
)

BASE_CONFIDENCE = 0.78
ADAPTIVE_CONFIDENCE_STEP = 0.06
MAX_CONFIDENCE = 0.95


def build_fallback_automation_recommendation(
    request: AutomationRecommendationRequest,
) -> AIAutomationRecommendation:
    sensor = request.sensor_reading
    profile = request.plant_profile
    safe_temperature_minimum, safe_temperature_maximum = profile.safe_temperature_range

    recommendation = AIAutomationRecommendation(
        crop_name=profile.crop_name,
        led_start_time="06:00",
        led_end_time="18:00",
        led_spectrum="mixed",
        fan_trigger_temperature=safe_temperature_maximum - 0.5,
        pump_interval_minutes=180,
        pump_duration_seconds=30,
        confidence=BASE_CONFIDENCE,
    )

    adaptive_rules_applied = 0

    if sensor.temperature > safe_temperature_maximum:
        recommendation.led_spectrum = "blue"
        recommendation.led_start_time = "07:00"
        recommendation.led_end_time = "17:00"
        recommendation.fan_trigger_temperature = max(
            safe_temperature_minimum,
            safe_temperature_maximum - 1.0,
        )
        adaptive_rules_applied += 1
    elif sensor.temperature < safe_temperature_minimum:
        recommendation.led_spectrum = "red"
        recommendation.led_start_time = "06:00"
        recommendation.led_end_time = "19:00"
        adaptive_rules_applied += 1

    safe_soil_moisture_minimum, safe_soil_moisture_maximum = (
        profile.safe_soil_moisture_range
    )
    if sensor.soil_moisture < safe_soil_moisture_minimum:
        recommendation.pump_interval_minutes = 90
        recommendation.pump_duration_seconds = 45
        adaptive_rules_applied += 1
    elif sensor.soil_moisture > safe_soil_moisture_maximum:
        recommendation.pump_interval_minutes = 240
        recommendation.pump_duration_seconds = 15
        adaptive_rules_applied += 1

    safe_water_level_minimum, _ = profile.safe_water_level_range
    if sensor.water_level < safe_water_level_minimum:
        recommendation.pump_interval_minutes = max(
            recommendation.pump_interval_minutes,
            240,
        )
        recommendation.pump_duration_seconds = min(
            recommendation.pump_duration_seconds,
            15,
        )
        adaptive_rules_applied += 1

    recommendation.confidence = round(
        min(
            BASE_CONFIDENCE + adaptive_rules_applied * ADAPTIVE_CONFIDENCE_STEP,
            MAX_CONFIDENCE,
        ),
        2,
    )
    return recommendation
