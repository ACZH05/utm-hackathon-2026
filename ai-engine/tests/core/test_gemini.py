import builtins

import pytest

from app.core.gemini import generate_json_content
from app.features.recommendation.schemas import RecommendationRequest


def test_generate_json_content_raises_when_google_genai_missing(
    monkeypatch,
    payload_factory,
) -> None:
    request = RecommendationRequest.model_validate(payload_factory())
    original_import = builtins.__import__

    def fake_import(name, globals=None, locals=None, fromlist=(), level=0):
        if name == "google" or name.startswith("google.genai"):
            raise ImportError("missing google-genai")
        return original_import(name, globals, locals, fromlist, level)

    monkeypatch.setattr(builtins, "__import__", fake_import)

    with pytest.raises(RuntimeError, match="google-genai is not installed."):
        generate_json_content(
            request=request,
            prompt="Return JSON.",
            api_key="fake-key",
            model_name="gemini-2.5-flash",
        )


def test_generate_json_content_raises_on_empty_response(
    install_fake_google_genai,
    payload_factory,
) -> None:
    install_fake_google_genai(response_text="   ")
    request = RecommendationRequest.model_validate(payload_factory())

    with pytest.raises(ValueError, match="empty response"):
        generate_json_content(
            request=request,
            prompt="Return JSON.",
            api_key="fake-key",
            model_name="gemini-2.5-flash",
        )


def test_generate_json_content_raises_on_invalid_json(
    install_fake_google_genai,
    payload_factory,
) -> None:
    install_fake_google_genai(response_text="not-json")
    request = RecommendationRequest.model_validate(payload_factory())

    with pytest.raises(ValueError, match="not valid JSON"):
        generate_json_content(
            request=request,
            prompt="Return JSON.",
            api_key="fake-key",
            model_name="gemini-2.5-flash",
        )
