import os
from dataclasses import dataclass

try:
    from dotenv import load_dotenv
except ImportError:  # pragma: no cover - keeps local tests runnable before install
    def load_dotenv(*args: object, **kwargs: object) -> bool:
        return False


@dataclass(slots=True)
class Settings:
    gemini_api_key: str
    gemini_model: str


def get_settings() -> Settings:
    load_dotenv()

    gemini_model = os.getenv("GEMINI_MODEL", "gemini-2.5-flash-lite").strip()

    return Settings(
        gemini_api_key=os.getenv("GEMINI_API_KEY", "").strip(),
        gemini_model=gemini_model or "gemini-2.5-flash-lite",
    )
