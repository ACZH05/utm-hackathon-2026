import { NextResponse } from "next/server";

import {
  parsePlantProfile,
  parseSensorReading,
} from "@/lib/automation-validation";
import { getSql } from "@/lib/db";
import {
  getActivePlantProfile,
  getLatestSensorReading,
} from "@/lib/db-repository";
import { generateAutomationRecommendation, mockPlantProfile } from "@/lib/mock-data";
import { getMockDashboardState } from "@/lib/mock-state";
import type { AIAutomationRecommendation, PlantProfile, SensorReading } from "@/lib/types";

interface AutomationRecommendationResponseBody {
  aiAutomationRecommendation?: AIAutomationRecommendation;
}

function getFastApiAutomationUrl() {
  const baseUrl = process.env.FASTAPI_URL ?? "http://localhost:8000";
  return `${baseUrl.replace(/\/$/, "")}/automation/recommend`;
}

async function requestAutomationFromFastApi(
  sensorReading: SensorReading,
  plantProfile: PlantProfile,
): Promise<AIAutomationRecommendation> {
  // Strip trayId and id as the AI Engine's Pydantic model forbids extra fields
  const { trayId, ...sensorReadingData } = sensorReading;
  const { id, ...plantProfileData } = plantProfile;

  const payload = {
    sensorReading: sensorReadingData,
    plantProfile: plantProfileData,
  };

  const response = await fetch(getFastApiAutomationUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`FastAPI automation request failed with ${response.status}.`);
  }

  const data = (await response.json()) as AutomationRecommendationResponseBody;

  if (!data.aiAutomationRecommendation) {
    throw new Error("FastAPI response did not include an automation recommendation.");
  }

  return data.aiAutomationRecommendation;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const trayId = body.trayId as string | undefined;

  if (!trayId) {
    return NextResponse.json({ error: "trayId is required" }, { status: 400 });
  }

  const sql = getSql();
  const sensorReading =
    parseSensorReading(body.sensorReading) ??
    (sql ? await getLatestSensorReading(sql, trayId) : null) ??
    { ...getMockDashboardState().sensorReading, trayId };

  const plantProfile =
    parsePlantProfile(body.plantProfile) ??
    (sql ? await getActivePlantProfile(sql, trayId) : null) ??
    mockPlantProfile;

  try {
    const aiRecommendation = await requestAutomationFromFastApi(sensorReading, plantProfile);
    return NextResponse.json({
      aiAutomationRecommendation: {
        ...aiRecommendation,
        trayId,
      },
    });
  } catch (error) {
    console.error("AI Automation generation failed, falling back to mock:", error);
    return NextResponse.json({
      aiAutomationRecommendation: generateAutomationRecommendation(
        sensorReading,
        plantProfile,
      ),
    });
  }
}
