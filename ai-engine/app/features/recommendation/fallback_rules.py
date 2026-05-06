from app.features.recommendation.schemas import (
    PlantProfile,
    Recommendation,
    RecommendationRequest,
    SensorReading,
)


def build_fallback_recommendation(
    request: RecommendationRequest,
) -> Recommendation:
    sensor = request.sensor_reading
    profile = request.plant_profile

    water_level_recommendation = _check_water_level(sensor, profile)
    if water_level_recommendation:
        return water_level_recommendation

    temperature_recommendation = _check_temperature(sensor, profile)
    if temperature_recommendation:
        return temperature_recommendation

    water_ph_recommendation = _check_water_ph(sensor, profile)
    if water_ph_recommendation:
        return water_ph_recommendation

    soil_moisture_recommendation = _check_soil_moisture(sensor, profile)
    if soil_moisture_recommendation:
        return soil_moisture_recommendation

    humidity_recommendation = _check_humidity(sensor, profile)
    if humidity_recommendation:
        return humidity_recommendation

    return Recommendation(
        title="System Conditions Stable",
        message=(
            f"{profile.crop_name} readings are within the safe ranges. "
            "Continue monitoring current conditions."
        ),
        suggested_action="Continue monitoring current conditions",
        severity="info",
        confidence=0.80,
    )


def _check_water_level(
    sensor: SensorReading,
    profile: PlantProfile,
) -> Recommendation | None:
    safe_minimum, safe_maximum = profile.safe_water_level_range

    if sensor.water_level >= safe_minimum:
        return None

    return Recommendation(
        title="Low Water Reservoir Level",
        message=(
            f"{profile.crop_name} water level is {_format_value(sensor.water_level)}, "
            f"below the safe range of {_format_range(safe_minimum, safe_maximum)}. "
            "Refill the water reservoir."
        ),
        suggested_action="Refill the water reservoir",
        severity="critical",
        confidence=0.95,
    )


def _check_temperature(
    sensor: SensorReading,
    profile: PlantProfile,
) -> Recommendation | None:
    safe_minimum, safe_maximum = profile.safe_temperature_range

    if sensor.temperature > safe_maximum:
        is_critical = sensor.temperature > safe_maximum + 3
        return Recommendation(
            title="High Temperature Detected",
            message=(
                f"{profile.crop_name} temperature is {_format_value(sensor.temperature)}, "
                f"above the safe range of {_format_range(safe_minimum, safe_maximum)}. "
                "Turn on the cooling fan."
            ),
            suggested_action="Turn on the cooling fan",
            severity="critical" if is_critical else "warning",
            confidence=0.90 if is_critical else 0.85,
        )

    if sensor.temperature < safe_minimum:
        is_critical = sensor.temperature < safe_minimum - 3
        return Recommendation(
            title="Low Temperature Detected",
            message=(
                f"{profile.crop_name} temperature is {_format_value(sensor.temperature)}, "
                f"below the safe range of {_format_range(safe_minimum, safe_maximum)}. "
                "Reduce cooling or increase lighting warmth."
            ),
            suggested_action="Reduce cooling or increase lighting warmth",
            severity="critical" if is_critical else "warning",
            confidence=0.88 if is_critical else 0.83,
        )

    return None


def _check_water_ph(
    sensor: SensorReading,
    profile: PlantProfile,
) -> Recommendation | None:
    safe_minimum, safe_maximum = profile.safe_water_ph_range

    if safe_minimum <= sensor.water_ph <= safe_maximum:
        return None

    return Recommendation(
        title="Water pH Out of Range",
        message=(
            f"{profile.crop_name} water pH is {_format_value(sensor.water_ph)}, "
            f"outside the safe range of {_format_range(safe_minimum, safe_maximum)}. "
            "Adjust nutrient solution pH."
        ),
        suggested_action="Adjust nutrient solution pH",
        severity="warning",
        confidence=0.84,
    )


def _check_soil_moisture(
    sensor: SensorReading,
    profile: PlantProfile,
) -> Recommendation | None:
    safe_minimum, safe_maximum = profile.safe_soil_moisture_range

    if sensor.soil_moisture >= safe_minimum:
        return None

    return Recommendation(
        title="Low Soil Moisture",
        message=(
            f"{profile.crop_name} soil moisture is {_format_value(sensor.soil_moisture)}, "
            f"below the safe range of {_format_range(safe_minimum, safe_maximum)}. "
            "Activate the water pump."
        ),
        suggested_action="Activate the water pump",
        severity="warning",
        confidence=0.82,
    )


def _check_humidity(
    sensor: SensorReading,
    profile: PlantProfile,
) -> Recommendation | None:
    safe_minimum, safe_maximum = profile.safe_humidity_range

    if safe_minimum <= sensor.humidity <= safe_maximum:
        return None

    return Recommendation(
        title="Humidity Out of Range",
        message=(
            f"{profile.crop_name} humidity is {_format_value(sensor.humidity)}, "
            f"outside the safe range of {_format_range(safe_minimum, safe_maximum)}. "
            "Adjust ventilation or misting settings."
        ),
        suggested_action="Adjust ventilation or misting settings",
        severity="warning",
        confidence=0.81,
    )


def _format_range(minimum: float, maximum: float) -> str:
    return f"{_format_value(minimum)}-{_format_value(maximum)}"


def _format_value(value: float) -> str:
    return f"{value:g}"
