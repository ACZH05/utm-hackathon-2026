import { NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import { getAutomationLogs } from "@/lib/db-repository";
import { getMockAutomationLogs } from "@/lib/mock-state";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const trayId = searchParams.get("trayId");
  const limit = Number(searchParams.get("limit") ?? "20");

  if (!trayId) {
    return NextResponse.json({ error: "trayId is required" }, { status: 400 });
  }

  const sql = getSql();

  if (!sql) {
    return NextResponse.json(getMockAutomationLogs(trayId, limit));
  }

  try {
    const logs = await getAutomationLogs(sql, trayId, limit);
    return NextResponse.json(logs);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to fetch automation logs.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
