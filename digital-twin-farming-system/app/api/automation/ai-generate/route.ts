import { NextResponse } from "next/server";

import {
  parsePlantProfile,
  parseSensorReading,
} from "@/lib/automation-validation";
import {
  generateMockAutomationRecommendation,
  getMockDashboardState,
  getMockPlantProfile,
} from "@/lib/mock-state";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const trayId = body.trayId as string | undefined;

  if (!trayId) {
    return NextResponse.json({ error: "trayId is required" }, { status: 400 });
  }

  const currentState = getMockDashboardState();
  const sensorReading =
    parseSensorReading(body.sensorReading) ?? { ...currentState.sensorReading, trayId };
  const plantProfile =
    parsePlantProfile(body.plantProfile) ?? getMockPlantProfile();

  return NextResponse.json({
    aiAutomationRecommendation: generateMockAutomationRecommendation(
      sensorReading,
      plantProfile,
    ),
  });
}
