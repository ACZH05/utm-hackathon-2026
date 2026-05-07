import pytest
from pydantic import ValidationError

from app.features.automation import gemini_service as automation_gemini_service
from app.features.automation.fallback_rules import (
    build_fallback_automation_recommendation,
)
from app.features.automation.schemas import (
    AIAutomationRecommendation,
    AutomationRecommendationRequest,
)
from app.features.automation.service import (
    generate_automation_recommendation as generate_service_automation_recommendation,
)


def test_automation_route_uses_fallback_without_gemini_key(
    client,
    monkeypatch,
    payload_factory,
) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = client.post("/automation/recommend", json=payload_factory())

    assert response.status_code == 200

    recommendation = response.json()["aiAutomationRecommendation"]
    assert recommendation["cropName"] == "Lettuce"
    assert recommendation["ledStartTime"] == "06:00"
    assert recommendation["ledEndTime"] == "18:00"
    assert recommendation["ledSpectrum"] == "mixed"
    assert recommendation["fanTriggerTemperature"] == 25.5
    assert recommendation["pumpIntervalMinutes"] == 180
    assert recommendation["pumpDurationSeconds"] == 30
    assert recommendation["confidence"] == 0.78
    assert set(recommendation) == {
        "cropName",
        "ledStartTime",
        "ledEndTime",
        "ledSpectrum",
        "fanTriggerTemperature",
        "pumpIntervalMinutes",
        "pumpDurationSeconds",
        "confidence",
    }


def test_automation_route_uses_gemini_success_path(
    client,
    monkeypatch,
    payload_factory,
) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")

    def fake_generate_automation_recommendation(
        request,
        api_key: str,
        model_name: str,
    ):
        assert request.plant_profile.crop_name == "Lettuce"
        assert api_key == "fake-key"
        assert model_name == "gemini-2.5-flash"
        return {
            "cropName": "Lettuce",
            "ledStartTime": "07:00",
            "ledEndTime": "17:00",
            "ledSpectrum": "blue",
            "fanTriggerTemperature": 25.0,
            "pumpIntervalMinutes": 120,
            "pumpDurationSeconds": 30,
            "confidence": 0.9,
        }

    monkeypatch.setattr(
        automation_gemini_service,
        "generate_automation_recommendation",
        fake_generate_automation_recommendation,
    )

    response = client.post(
        "/automation/recommend",
        json=payload_factory(temperature=29),
    )

    assert response.status_code == 200
    recommendation = response.json()["aiAutomationRecommendation"]
    assert recommendation["ledSpectrum"] == "blue"
    assert recommendation["fanTriggerTemperature"] == 25.0


def test_automation_route_rejects_invalid_payload(client) -> None:
    response = client.post("/automation/recommend", json={"sensorReading": {}})

    assert response.status_code == 422


def test_automation_service_logs_and_falls_back_when_gemini_fails(
    monkeypatch,
    caplog,
    payload_factory,
) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.5-flash")

    def raise_invalid_json(*args, **kwargs):
        raise ValueError(
            "Gemini response for model 'gemini-2.5-flash' was not valid JSON."
        )

    monkeypatch.setattr(
        automation_gemini_service,
        "generate_automation_recommendation",
        raise_invalid_json,
    )

    request = AutomationRecommendationRequest.model_validate(
        payload_factory(soilMoisture=20),
    )

    with caplog.at_level("WARNING"):
        recommendation = generate_service_automation_recommendation(request)

    assert recommendation.pump_interval_minutes == 90
    assert recommendation.pump_duration_seconds == 45
    assert "Falling back to rule-based automation recommendation after Gemini failure" in caplog.text
    assert "not valid JSON" in caplog.text


def test_automation_fallback_returns_stable_baseline(
    payload_factory,
) -> None:
    request = AutomationRecommendationRequest.model_validate(payload_factory())

    recommendation = build_fallback_automation_recommendation(request)

    assert recommendation.model_dump(by_alias=True) == {
        "cropName": "Lettuce",
        "ledStartTime": "06:00",
        "ledEndTime": "18:00",
        "ledSpectrum": "mixed",
        "fanTriggerTemperature": 25.5,
        "pumpIntervalMinutes": 180,
        "pumpDurationSeconds": 30,
        "confidence": 0.78,
    }


def test_automation_fallback_adapts_to_high_temperature(
    payload_factory,
) -> None:
    request = AutomationRecommendationRequest.model_validate(
        payload_factory(temperature=30),
    )

    recommendation = build_fallback_automation_recommendation(request)

    assert recommendation.led_spectrum == "blue"
    assert recommendation.led_start_time == "07:00"
    assert recommendation.led_end_time == "17:00"
    assert recommendation.fan_trigger_temperature == 25.0
    assert recommendation.confidence == 0.84


def test_automation_fallback_adapts_to_low_temperature(
    payload_factory,
) -> None:
    request = AutomationRecommendationRequest.model_validate(
        payload_factory(temperature=15),
    )

    recommendation = build_fallback_automation_recommendation(request)

    assert recommendation.led_spectrum == "red"
    assert recommendation.led_start_time == "06:00"
    assert recommendation.led_end_time == "19:00"
    assert recommendation.fan_trigger_temperature == 25.5
    assert recommendation.confidence == 0.84


def test_automation_fallback_boosts_irrigation_for_low_soil_moisture(
    payload_factory,
) -> None:
    request = AutomationRecommendationRequest.model_validate(
        payload_factory(soilMoisture=20),
    )

    recommendation = build_fallback_automation_recommendation(request)

    assert recommendation.pump_interval_minutes == 90
    assert recommendation.pump_duration_seconds == 45
    assert recommendation.confidence == 0.84


def test_automation_fallback_slows_irrigation_for_high_soil_moisture(
    payload_factory,
) -> None:
    request = AutomationRecommendationRequest.model_validate(
        payload_factory(soilMoisture=80),
    )

    recommendation = build_fallback_automation_recommendation(request)

    assert recommendation.pump_interval_minutes == 240
    assert recommendation.pump_duration_seconds == 15
    assert recommendation.confidence == 0.84


def test_automation_fallback_prioritizes_low_water_level_override(
    payload_factory,
) -> None:
    request = AutomationRecommendationRequest.model_validate(
        payload_factory(temperature=30, soilMoisture=20, waterLevel=10),
    )

    recommendation = build_fallback_automation_recommendation(request)

    assert recommendation.led_spectrum == "blue"
    assert recommendation.pump_interval_minutes == 240
    assert recommendation.pump_duration_seconds == 15
    assert recommendation.confidence == 0.95


@pytest.mark.parametrize(
    "payload",
    [
        {"ledStartTime": "6:00"},
        {"ledSpectrum": "green"},
        {"pumpIntervalMinutes": 0},
        {"pumpDurationSeconds": -5},
        {"confidence": 1.1},
    ],
)
def test_ai_automation_recommendation_validation_rejects_invalid_output(
    payload: dict[str, object],
    automation_payload_factory,
) -> None:
    with pytest.raises(ValidationError):
        AIAutomationRecommendation.model_validate(
            automation_payload_factory(**payload),
        )
