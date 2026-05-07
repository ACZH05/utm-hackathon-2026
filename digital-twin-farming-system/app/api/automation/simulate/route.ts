import { NextResponse } from "next/server";

import {
  parseAutomationSettings,
  parseMockCurrentTime,
  parseSensorReading,
} from "@/lib/automation-validation";
import { getSql } from "@/lib/db";
import {
  getDashboardState,
  insertAutomationLog,
  insertDeviceStateSnapshot,
} from "@/lib/db-repository";
import { simulateAutomation } from "@/lib/mock-data";
import { getMockDashboardState, runMockAutomationSimulation } from "@/lib/mock-state";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const mockCurrentTime = parseMockCurrentTime(body.mockCurrentTime);

  if (!mockCurrentTime) {
    return NextResponse.json(
      {
        error: "Request body must include mockCurrentTime in HH:mm format.",
      },
      { status: 400 },
    );
  }

  const sql = getSql();

  if (!sql) {
    const currentState = getMockDashboardState();
    const sensorReading =
      parseSensorReading(body.sensorReading) ?? currentState.sensorReading;
    const automationSettings =
      parseAutomationSettings(body.automationSettings) ??
      currentState.automationSettings;

    return NextResponse.json(
      runMockAutomationSimulation(
        sensorReading,
        automationSettings,
        mockCurrentTime,
      ),
    );
  }

  try {
    const dashboardState = await getDashboardState(sql);
    const sensorReading =
      parseSensorReading(body.sensorReading) ?? dashboardState.sensorReading;
    const automationSettings =
      parseAutomationSettings(body.automationSettings) ??
      dashboardState.automationSettings;

    const result = simulateAutomation(
      sensorReading,
      automationSettings,
      dashboardState.deviceState,
      mockCurrentTime,
    );

    const updatedDeviceState = await insertDeviceStateSnapshot(
      sql,
      result.deviceState,
    );

    if (result.automationEvent) {
      await insertAutomationLog(sql, result.automationEvent);
    }

    return NextResponse.json({
      deviceState: updatedDeviceState,
      automationEvent: result.automationEvent,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to run automation simulation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
