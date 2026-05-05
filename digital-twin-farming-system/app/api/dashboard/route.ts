import { NextResponse } from "next/server";

import { mockDigitalTwinState } from "@/lib/mock-data";

export function GET() {
  return NextResponse.json(mockDigitalTwinState);
}
