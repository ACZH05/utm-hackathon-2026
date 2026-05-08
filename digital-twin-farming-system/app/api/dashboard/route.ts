import { type NextRequest, NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import { getDashboardState, getTrays } from "@/lib/db-repository";
import { getMockDashboardState } from "@/lib/mock-state";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  let trayId = searchParams.get("trayId");

  const sql = getSql();

  if (!sql) {
    return NextResponse.json(getMockDashboardState());
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
    return NextResponse.json(await getDashboardState(sql, trayId));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load dashboard state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
