import json
import logging
from typing import Any, Callable, TypeVar

from pydantic import BaseModel

from app.core.config import get_settings

RequestModelT = TypeVar("RequestModelT", bound=BaseModel)
ResponseModelT = TypeVar("ResponseModelT", bound=BaseModel)

logger = logging.getLogger(__name__)


def generate_json_content(
    *,
    request: BaseModel,
    prompt: str,
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

    try:
        response = client.models.generate_content(
            model=model_name,
            contents=f"{prompt} Data: {request_payload}",
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
    if not response_text or not response_text.strip():
        raise ValueError(f"Gemini returned an empty response for model '{model_name}'.")

    try:
        response_payload = json.loads(response_text)
    except json.JSONDecodeError as exc:
        raise ValueError(
            f"Gemini response for model '{model_name}' was not valid JSON."
        ) from exc

    if not isinstance(response_payload, dict):
        raise ValueError(
            f"Gemini response for model '{model_name}' must be a JSON object."
        )

    return response_payload


def generate_with_fallback(
    *,
    request: RequestModelT,
    response_model: type[ResponseModelT],
    fallback_factory: Callable[[RequestModelT], ResponseModelT],
    gemini_factory: Callable[[RequestModelT, str, str], dict[str, Any]],
    feature_name: str,
) -> ResponseModelT:
    settings = get_settings()

    if not settings.gemini_api_key:
        return fallback_factory(request)

    try:
        gemini_payload = gemini_factory(
            request,
            settings.gemini_api_key,
            settings.gemini_model,
        )
        return response_model.model_validate(gemini_payload)
    except Exception as exc:
        logger.warning(
            "Falling back to rule-based %s after Gemini failure (model=%s): %s",
            feature_name,
            settings.gemini_model,
            exc,
        )
        return fallback_factory(request)
