import { type NextRequest, NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getTrays } from "@/lib/db-repository";

export async function GET(request: NextRequest) {
  const sql = getSql();

  if (!sql) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const rackId = searchParams.get("rackId") || undefined;

  try {
    const trays = await getTrays(sql, rackId);
    return NextResponse.json(trays);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch trays.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
