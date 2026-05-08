import { NextResponse } from "next/server";
import { getSql } from "@/lib/db";
import { getRacks } from "@/lib/db-repository";

export async function GET() {
  const sql = getSql();

  if (!sql) {
    return NextResponse.json({ error: "Database not configured." }, { status: 500 });
  }

  try {
    const racks = await getRacks(sql);
    return NextResponse.json(racks);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch racks.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
