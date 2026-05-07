import { NextResponse } from "next/server";

import { parseAutomationRecommendation } from "@/lib/automation-validation";
import { getSql } from "@/lib/db";
import { insertAutomationLog, insertAutomationProfile } from "@/lib/db-repository";
import { applyAutomationRecommendation } from "@/lib/mock-data";
import { applyMockAutomationRecommendation } from "@/lib/mock-state";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const aiAutomationRecommendation = parseAutomationRecommendation(
    body.aiAutomationRecommendation,
  );

  if (!aiAutomationRecommendation) {
    return NextResponse.json(
      {
        error:
          "Request body must include a valid aiAutomationRecommendation payload.",
      },
      { status: 400 },
    );
  }

  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      automationSettings: applyMockAutomationRecommendation(aiAutomationRecommendation),
    });
  }

  try {
    const automationSettings = applyAutomationRecommendation(aiAutomationRecommendation);
    const savedSettings = await insertAutomationProfile(sql, automationSettings);

    await insertAutomationLog(sql, {
      device: "led",
      action: "on",
      triggeredBy: "ai",
      message: `AI-assisted automation profile applied for ${aiAutomationRecommendation.cropName}.`,
      createdAt: new Date().toISOString(),
    });

    return NextResponse.json({
      automationSettings: savedSettings,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to apply AI automation.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
