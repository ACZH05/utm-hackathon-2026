# AI Engine

This service is the standalone FastAPI AI interface for the UTMxHackathon vertical farming digital twin. It accepts the latest sensor reading and plant profile, then returns either an immediate control recommendation or directly applicable automation settings.

Gemini is the primary generation path for both endpoints. If `GEMINI_API_KEY` is missing or Gemini fails, the service automatically falls back to deterministic rule-based logic.

## Folder structure

```text
ai-engine/
  app/
    main.py
    core/
      config.py
      gemini.py
    features/
      automation/
        controller.py
        fallback_rules.py
        gemini_service.py
        route.py
        schemas.py
        service.py
      recommendation/
        controller.py
        fallback_rules.py
        gemini_service.py
        route.py
        schemas.py
        service.py
      shared/
        schemas.py
  tests/
    test_recommendation_route.py
  requirements.txt
  README.md
```

## Setup

Create and activate a virtual environment from inside `ai-engine`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```powershell
pip install -r requirements.txt
```

## Run the server

Start the FastAPI app from inside `ai-engine`:

```powershell
uvicorn app.main:app --reload
```

The service exposes:

- `GET /`
- `POST /recommendation`
- `POST /automation/recommend`

## Run tests

```powershell
pytest
```

## Environment variables

Gemini is optional at runtime because the rule-based fallback always remains available.

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Example request: recommendation

```bash
curl -X POST "http://127.0.0.1:8000/recommendation" \
  -H "Content-Type: application/json" \
  -d '{
    "sensorReading": {
      "temperature": 32,
      "humidity": 70,
      "soilMoisture": 45,
      "waterPh": 6.5,
      "waterLevel": 35,
      "createdAt": "2026-05-06T12:00:00Z"
    },
    "plantProfile": {
      "cropName": "Lettuce",
      "safeTemperatureRange": [18, 26],
      "safeHumidityRange": [50, 80],
      "safeSoilMoistureRange": [40, 70],
      "safeWaterPhRange": [5.5, 6.5],
      "safeWaterLevelRange": [40, 100]
    }
  }'
```

## Example response: recommendation

```json
{
  "recommendation": {
    "title": "Low Water Reservoir Level",
    "message": "Lettuce water level is 35, below the safe range of 40-100. Refill the water reservoir.",
    "suggestedAction": "Refill the water reservoir",
    "severity": "critical",
    "confidence": 0.95
  }
}
```

## Example request: automation recommendation

```bash
curl -X POST "http://127.0.0.1:8000/automation/recommend" \
  -H "Content-Type: application/json" \
  -d '{
    "sensorReading": {
      "temperature": 30,
      "humidity": 65,
      "soilMoisture": 25,
      "waterPh": 6.1,
      "waterLevel": 55,
      "createdAt": "2026-05-06T12:00:00Z"
    },
    "plantProfile": {
      "cropName": "Lettuce",
      "safeTemperatureRange": [18, 26],
      "safeHumidityRange": [50, 80],
      "safeSoilMoistureRange": [40, 70],
      "safeWaterPhRange": [5.5, 6.5],
      "safeWaterLevelRange": [40, 100]
    }
  }'
```

## Example response: automation recommendation

```json
{
  "aiAutomationRecommendation": {
    "cropName": "Lettuce",
    "ledStartTime": "07:00",
    "ledEndTime": "17:00",
    "ledSpectrum": "blue",
    "fanTriggerTemperature": 25.0,
    "pumpIntervalMinutes": 90,
    "pumpDurationSeconds": 45,
    "confidence": 0.9
  }
}
```
