# AI Engine

This service is the standalone FastAPI AI interface for the UTMxHackathon vertical farming digital twin. It accepts the latest sensor reading and plant profile, then returns one recommendation through either Gemini or a deterministic fallback rule set.

## Folder structure

```text
ai-engine/
  app/
    main.py
    core/
      config.py
    features/
      recommendation/
        controller.py
        fallback_rules.py
        gemini_service.py
        route.py
        schemas.py
        service.py
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

## Run tests

```powershell
pytest
```

## Environment variables

Gemini is optional. If `GEMINI_API_KEY` is missing or Gemini fails, the service automatically falls back to rule-based recommendations.

```env
GEMINI_API_KEY=your_key_here
GEMINI_MODEL=gemini-2.5-flash
```

## Example request

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

## Response shape

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
