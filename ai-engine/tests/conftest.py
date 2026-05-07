import sys
import types
from pathlib import Path
from types import SimpleNamespace

import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.main import app


@pytest.fixture
def client() -> TestClient:
    return TestClient(app)


@pytest.fixture
def payload_factory():
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

    return make_payload


@pytest.fixture
def automation_payload_factory():
    def make_automation_payload(**overrides: object) -> dict[str, object]:
        payload = {
            "cropName": "Lettuce",
            "ledStartTime": "06:00",
            "ledEndTime": "18:00",
            "ledSpectrum": "mixed",
            "fanTriggerTemperature": 25.5,
            "pumpIntervalMinutes": 180,
            "pumpDurationSeconds": 30,
            "confidence": 0.78,
        }
        payload.update(overrides)
        return payload

    return make_automation_payload


@pytest.fixture
def install_fake_google_genai(monkeypatch):
    def install(
        *,
        response_text: str = '{"ok": true}',
        exc: Exception | None = None,
    ) -> None:
        class FakeModels:
            def generate_content(self, **kwargs):
                if exc is not None:
                    raise exc
                return SimpleNamespace(text=response_text)

        class FakeClient:
            def __init__(self, api_key: str):
                self.api_key = api_key
                self.models = FakeModels()

        class FakeGenerateContentConfig:
            def __init__(self, **kwargs):
                self.kwargs = kwargs

        google_module = types.ModuleType("google")
        genai_module = types.ModuleType("google.genai")
        genai_module.Client = FakeClient
        genai_module.types = SimpleNamespace(
            GenerateContentConfig=FakeGenerateContentConfig,
        )
        google_module.genai = genai_module

        monkeypatch.setitem(sys.modules, "google", google_module)
        monkeypatch.setitem(sys.modules, "google.genai", genai_module)

    return install
