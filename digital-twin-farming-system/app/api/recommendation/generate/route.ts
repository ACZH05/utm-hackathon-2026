import { NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import {
  getActivePlantProfile,
  getLatestSensorReading,
  insertRecommendation,
} from "@/lib/db-repository";
import { generateRecommendation, mockPlantProfile } from "@/lib/mock-data";
import type { PlantProfile, Recommendation, SensorReading } from "@/lib/types";

interface RecommendationRequestBody {
  sensorReading?: SensorReading;
  plantProfile?: PlantProfile;
}

interface RecommendationResponseBody {
  recommendation?: Recommendation;
}

function getFastApiRecommendationUrl() {
  const baseUrl = process.env.FASTAPI_URL ?? "http://localhost:8000";
  return `${baseUrl.replace(/\/$/, "")}/recommendation`;
}

async function requestRecommendationFromFastApi(
  sensorReading: SensorReading,
  plantProfile: PlantProfile,
): Promise<Recommendation> {
  const response = await fetch(getFastApiRecommendationUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      sensorReading,
      plantProfile,
    }),
  });

  if (!response.ok) {
    throw new Error(`FastAPI recommendation request failed with ${response.status}.`);
  }

  const payload = (await response.json()) as RecommendationResponseBody;

  if (!payload.recommendation) {
    throw new Error("FastAPI response did not include a recommendation.");
  }

  return payload.recommendation;
}

export async function POST(request: Request) {
  const requestBody = (await request.json().catch(
    () => ({}),
  )) as RecommendationRequestBody;
  const sql = getSql();
  const sensorReading =
    requestBody.sensorReading ?? (sql ? await getLatestSensorReading(sql) : null);
  const plantProfile =
    requestBody.plantProfile ??
    (sql ? await getActivePlantProfile(sql) : null) ??
    mockPlantProfile;

  if (!sensorReading) {
    return NextResponse.json(
      {
        error:
          "Request body must include sensorReading when the database is unavailable.",
      },
      { status: 400 },
    );
  }

  try {
    let recommendation: Recommendation;

    try {
      recommendation = await requestRecommendationFromFastApi(sensorReading, plantProfile);
    } catch {
      recommendation = generateRecommendation(sensorReading, plantProfile);
    }

    if (!sql) {
      return NextResponse.json({ recommendation });
    }

    return NextResponse.json({
      recommendation: await insertRecommendation(sql, recommendation),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to generate recommendation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
