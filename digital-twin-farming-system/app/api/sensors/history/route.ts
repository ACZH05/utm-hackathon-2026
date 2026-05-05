import { NextResponse } from "next/server";

import { mockSensorHistory } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json({
    readings: mockSensorHistory,
  });
}
