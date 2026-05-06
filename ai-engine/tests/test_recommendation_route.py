import sys
from pathlib import Path

from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.features.recommendation import gemini_service
from app.main import app
from app.features.recommendation.service import generate_recommendation as generate_service_recommendation
from app.features.recommendation.schemas import RecommendationRequest

client = TestClient(app)


def make_payload(**sensor_overrides: float | str) -> dict[str, object]:
    sensor_reading = {
        "temperature": 24,
        "humidity": 65,
        "soilMoisture": 55,
        "waterPh": 6.2,
        "waterLevel": 60,
        "createdAt": "2026-05-06T12:00:00Z",
    }
    sensor_reading.update(sensor_overrides)

    return {
        "sensorReading": sensor_reading,
        "plantProfile": {
            "cropName": "Lettuce",
            "safeTemperatureRange": [18, 26],
            "safeHumidityRange": [50, 80],
            "safeSoilMoistureRange": [40, 70],
            "safeWaterPhRange": [5.5, 6.5],
            "safeWaterLevelRange": [40, 100],
        },
    }


def test_health_route_returns_ok() -> None:
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_recommendation_route_uses_fallback_without_gemini_key(
    monkeypatch,
) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = client.post(
        "/recommendation",
        json=make_payload(waterLevel=20),
    )

    assert response.status_code == 200

    recommendation = response.json()["recommendation"]
    assert recommendation["title"] == "Low Water Reservoir Level"
    assert recommendation["suggestedAction"] == "Refill the water reservoir"
    assert recommendation["severity"] == "critical"
    assert 0.0 <= recommendation["confidence"] <= 1.0


def test_recommendation_route_returns_stable_shape() -> None:
    response = client.post("/recommendation", json=make_payload())

    assert response.status_code == 200

    recommendation = response.json()["recommendation"]
    assert recommendation["title"] == "System Conditions Stable"
    assert recommendation["severity"] == "info"
    assert set(recommendation) == {
        "title",
        "message",
        "suggestedAction",
        "severity",
        "confidence",
    }


def test_recommendation_route_rejects_invalid_payload() -> None:
    response = client.post("/recommendation", json={"plantProfile": {}})

    assert response.status_code == 422


def test_recommendation_route_falls_back_when_gemini_fails(
    monkeypatch,
) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")

    def raise_gemini_error(*args, **kwargs):
        raise RuntimeError("Gemini unavailable")

    monkeypatch.setattr(
        gemini_service,
        "generate_recommendation",
        raise_gemini_error,
    )

    response = client.post(
        "/recommendation",
        json=make_payload(waterLevel=15),
    )

    assert response.status_code == 200
    assert response.json()["recommendation"]["title"] == "Low Water Reservoir Level"


def test_service_logs_and_falls_back_when_gemini_404_occurs(
    monkeypatch,
    caplog,
) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.5-flash")

    def raise_not_found(*args, **kwargs):
        raise RuntimeError(
            "Gemini generate_content failed for model 'gemini-2.5-flash': 404 NOT_FOUND"
        )

    monkeypatch.setattr(
        gemini_service,
        "generate_recommendation",
        raise_not_found,
    )

    request = RecommendationRequest.model_validate(make_payload(waterLevel=15))

    with caplog.at_level("WARNING"):
        recommendation = generate_service_recommendation(request)

    assert recommendation.title == "Low Water Reservoir Level"
    assert "Falling back to rule-based recommendation after Gemini failure" in caplog.text
    assert "gemini-2.5-flash" in caplog.text
    assert "404 NOT_FOUND" in caplog.text
