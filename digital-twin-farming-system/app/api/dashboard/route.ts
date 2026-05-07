import { NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import { getDashboardState } from "@/lib/db-repository";
import { getMockDashboardState } from "@/lib/mock-state";

export async function GET() {
  const sql = getSql();

  if (!sql) {
    return NextResponse.json(getMockDashboardState());
  }

  try {
    return NextResponse.json(await getDashboardState(sql));
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load dashboard state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
