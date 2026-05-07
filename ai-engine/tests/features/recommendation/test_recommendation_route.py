import pytest

from app.features.recommendation import gemini_service as recommendation_gemini_service
from app.features.recommendation.schemas import RecommendationRequest
from app.features.recommendation.service import (
    generate_recommendation as generate_service_recommendation,
)


def test_recommendation_route_uses_fallback_without_gemini_key(
    client,
    monkeypatch,
    payload_factory,
) -> None:
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    response = client.post(
        "/recommendation",
        json=payload_factory(waterLevel=20),
    )

    assert response.status_code == 200

    recommendation = response.json()["recommendation"]
    assert recommendation["title"] == "Low Water Reservoir Level"
    assert recommendation["suggestedAction"] == "Refill the water reservoir"
    assert recommendation["severity"] == "critical"
    assert 0.0 <= recommendation["confidence"] <= 1.0


def test_recommendation_route_uses_gemini_success_path(
    client,
    monkeypatch,
    payload_factory,
) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")

    def fake_generate_recommendation(request, api_key: str, model_name: str):
        assert request.plant_profile.crop_name == "Lettuce"
        assert api_key == "fake-key"
        assert model_name == "gemini-2.5-flash"
        return {
            "title": "High Temperature Detected",
            "message": "Temperature is trending high. Turn on the cooling fan.",
            "suggestedAction": "Turn on the cooling fan",
            "severity": "warning",
            "confidence": 0.86,
        }

    monkeypatch.setattr(
        recommendation_gemini_service,
        "generate_recommendation",
        fake_generate_recommendation,
    )

    response = client.post("/recommendation", json=payload_factory(temperature=29))

    assert response.status_code == 200
    assert response.json()["recommendation"]["title"] == "High Temperature Detected"


def test_recommendation_route_returns_stable_shape(
    client,
    payload_factory,
) -> None:
    response = client.post("/recommendation", json=payload_factory())

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


def test_recommendation_route_rejects_invalid_payload(client) -> None:
    response = client.post("/recommendation", json={"plantProfile": {}})

    assert response.status_code == 422


@pytest.mark.parametrize(
    "raised_error",
    [
        RuntimeError("google-genai is not installed."),
        RuntimeError(
            "Gemini generate_content failed for model 'gemini-2.5-flash': 404 NOT_FOUND"
        ),
        ValueError("Gemini returned an empty response for model 'gemini-2.5-flash'."),
        ValueError("Gemini response for model 'gemini-2.5-flash' was not valid JSON."),
    ],
)
def test_recommendation_service_logs_and_falls_back_for_gemini_errors(
    monkeypatch,
    caplog,
    raised_error: Exception,
    payload_factory,
) -> None:
    monkeypatch.setenv("GEMINI_API_KEY", "fake-key")
    monkeypatch.setenv("GEMINI_MODEL", "gemini-2.5-flash")

    def raise_error(*args, **kwargs):
        raise raised_error

    monkeypatch.setattr(
        recommendation_gemini_service,
        "generate_recommendation",
        raise_error,
    )

    request = RecommendationRequest.model_validate(payload_factory(waterLevel=15))

    with caplog.at_level("WARNING"):
        recommendation = generate_service_recommendation(request)

    assert recommendation.title == "Low Water Reservoir Level"
    assert "Falling back to rule-based recommendation after Gemini failure" in caplog.text
    assert "gemini-2.5-flash" in caplog.text
    assert str(raised_error) in caplog.text
