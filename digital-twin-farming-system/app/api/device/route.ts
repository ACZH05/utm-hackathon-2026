import { NextResponse } from "next/server";

import { getSql } from "@/lib/db";
import {
  applyDeviceStatus,
  getLatestDeviceState,
  insertDeviceStateSnapshot,
} from "@/lib/db-repository";
import { mockDeviceState } from "@/lib/mock-data";
import type { DeviceStatus } from "@/lib/types";

const validDevices = ["led", "fan", "pump", "reservoir"] as const;
const validStatuses = ["normal", "warning", "critical", "off", "on"] as const;

type DeviceName = (typeof validDevices)[number];

interface DevicePatchBody {
  device?: unknown;
  status?: unknown;
}

function isDeviceName(value: unknown): value is DeviceName {
  return typeof value === "string" && validDevices.includes(value as DeviceName);
}

function isDeviceStatus(value: unknown): value is DeviceStatus {
  return typeof value === "string" && validStatuses.includes(value as DeviceStatus);
}

export async function PATCH(request: Request) {
  const body = (await request.json().catch(() => ({}))) as DevicePatchBody;

  if (!isDeviceName(body.device) || !isDeviceStatus(body.status)) {
    return NextResponse.json(
      {
        error:
          "Request body must include device led|fan|pump|reservoir and status normal|warning|critical|off|on.",
      },
      { status: 400 },
    );
  }

  const sql = getSql();

  if (!sql) {
    return NextResponse.json({
      deviceState: applyDeviceStatus(mockDeviceState, body.device, body.status),
    });
  }

  try {
    const currentDeviceState = (await getLatestDeviceState(sql)) ?? mockDeviceState;
    const nextDeviceState = applyDeviceStatus(
      currentDeviceState,
      body.device,
      body.status,
    );

    return NextResponse.json({
      deviceState: await insertDeviceStateSnapshot(sql, nextDeviceState),
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to update device state.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
