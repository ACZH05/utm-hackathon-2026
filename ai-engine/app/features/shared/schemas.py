from datetime import datetime

from pydantic import BaseModel, ConfigDict


def to_camel(value: str) -> str:
    parts = value.split("_")
    return parts[0] + "".join(word.capitalize() for word in parts[1:])


class CamelModel(BaseModel):
    model_config = ConfigDict(
        alias_generator=to_camel,
        populate_by_name=True,
        extra="forbid",
    )


class SensorReading(CamelModel):
    temperature: float
    humidity: float
    soil_moisture: float
    water_ph: float
    water_level: float
    created_at: datetime


class PlantProfile(CamelModel):
    crop_name: str
    safe_temperature_range: tuple[float, float]
    safe_humidity_range: tuple[float, float]
    safe_soil_moisture_range: tuple[float, float]
    safe_water_ph_range: tuple[float, float]
    safe_water_level_range: tuple[float, float]


class DecisionRequest(CamelModel):
    sensor_reading: SensorReading
    plant_profile: PlantProfile
