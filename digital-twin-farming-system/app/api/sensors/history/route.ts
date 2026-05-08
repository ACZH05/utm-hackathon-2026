import { type NextRequest, NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import { getSensorHistory, getTrays } from "@/lib/db-repository";
import { mockSensorHistory } from "@/lib/mock-data";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let trayId = searchParams.get("trayId");

  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      readings: mockSensorHistory,
    });
  }

  if (!trayId) {
    const trays = await getTrays(sql);
    if (trays.length > 0) {
      trayId = trays[0].id;
    } else {
      return NextResponse.json({ error: "trayId is required and no trays found" }, { status: 400 });
    }
  }

  try {
    return NextResponse.json({
      readings: await getSensorHistory(sql, trayId),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load sensor history.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
