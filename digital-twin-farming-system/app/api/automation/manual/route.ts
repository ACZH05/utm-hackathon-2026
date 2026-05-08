import { NextResponse } from "next/server";

import { parseAutomationSettings } from "@/lib/automation-validation";
import { getSql } from "@/lib/db";
import { insertAutomationLog, insertAutomationProfile } from "@/lib/db-repository";
import { saveMockAutomationSettings } from "@/lib/mock-state";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as unknown;
  const automationSettings = parseAutomationSettings(body);

  if (!automationSettings || automationSettings.mode !== "manual") {
    return NextResponse.json(
      {
        error:
          "Request body must include manual automation settings with valid LED, fan, and pump values.",
      },
      { status: 400 },
    );
  }

  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      automationSettings: saveMockAutomationSettings(automationSettings),
    });
  }

  try {
    const savedSettings = await insertAutomationProfile(sql, automationSettings);

    await insertAutomationLog(sql, {
      trayId: automationSettings.trayId,
      triggeredBy: "manual",
      message: "Manual automation profile saved for LED, fan, and pump.",
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      automationSettings: savedSettings,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save automation settings.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
