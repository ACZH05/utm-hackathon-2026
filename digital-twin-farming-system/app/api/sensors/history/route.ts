import { NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import { getSensorHistory } from "@/lib/db-repository";
import { mockSensorHistory } from "@/lib/mock-data";

export async function GET() {
  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      readings: mockSensorHistory,
    });
  }

  try {
    return NextResponse.json({
      readings: await getSensorHistory(sql),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load sensor history.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
