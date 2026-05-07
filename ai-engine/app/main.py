from fastapi import FastAPI

from app.features.automation.route import router as automation_router
from app.features.recommendation.route import router as recommendation_router

app = FastAPI(
    title="UTMxHackathon AI Engine",
    description=(
        "Standalone FastAPI recommendation and automation service for the "
        "vertical farming demo."
    ),
)


@app.get("/")
def health_check() -> dict[str, str]:
    return {"status": "ok"}


app.include_router(recommendation_router)
app.include_router(automation_router)
