import json
from typing import Any

from app.features.recommendation.schemas import RecommendationRequest


def generate_recommendation(
    request: RecommendationRequest,
    api_key: str,
    model_name: str,
) -> dict[str, Any]:
    if not api_key:
        raise ValueError("GEMINI_API_KEY is required for Gemini requests.")

    try:
        from google import genai
        from google.genai import types
    except ImportError as exc:  # pragma: no cover - depends on local install
        raise RuntimeError("google-genai is not installed.") from exc

    client = genai.Client(api_key=api_key)
    request_payload = json.dumps(
        request.model_dump(mode="json", by_alias=True),
        separators=(",", ":"),
    )
    prompt = (
        "Return exactly one JSON object with keys "
        "title, message, suggestedAction, severity, confidence. "
        "Severity must be info, warning, or critical. "
        "Confidence must be a number between 0 and 1. "
        "No markdown or extra text. "
        f"Data: {request_payload}"
    )

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                temperature=0,
                response_mime_type="application/json",
            ),
        )
    except Exception as exc:
        raise RuntimeError(
            f"Gemini generate_content failed for model '{model_name}': {exc}"
        ) from exc

    response_text = getattr(response, "text", "")
    if not response_text:
        raise ValueError(f"Gemini returned an empty response for model '{model_name}'.")

    response_payload = json.loads(response_text)
    if not isinstance(response_payload, dict):
        raise ValueError(
            f"Gemini response for model '{model_name}' must be a JSON object."
        )

    return response_payload
