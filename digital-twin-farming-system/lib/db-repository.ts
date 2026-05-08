import {
  generateAlerts,
  generateRecommendation,
  mockAutomationSettings,
  mockDeviceState,
  mockPlantProfile,
} from "./mock-data";
import type {
  Alert,
  AutomationEvent,
  AutomationSettings,
  DeviceState,
  DeviceStatus,
  DigitalTwinState,
  PlantProfile,
  Rack,
  Recommendation,
  SensorReading,
  Tray,
} from "./types";
import type { SqlClient } from "./db";
import {
  mapAutomationEvent,
  mapAutomationSettings,
  mapDeviceState,
  mapPlantProfile,
  mapRack,
  mapRecommendation,
  mapSensorReading,
  mapTray,
  type AutomationLogRow,
  type AutomationSettingsRow,
  type DeviceStateRow,
  type PlantProfileRow,
  type RackRow,
  type RecommendationRow,
  type SensorReadingRow,
  type TrayRow,
} from "./db-mappers";

export async function getRacks(sql: SqlClient): Promise<Rack[]> {
  const rows = (await sql`
    SELECT id, name, created_at
    FROM racks
    ORDER BY name ASC
  `) as RackRow[];

  return rows.map(mapRack);
}

export async function getTrays(
  sql: SqlClient,
  rackId?: string,
): Promise<Tray[]> {
  const rows = rackId
    ? ((await sql`
        SELECT id, rack_id, name, plant_profile_id, created_at
        FROM trays
        WHERE rack_id = ${rackId}
        ORDER BY name ASC
      `) as TrayRow[])
    : ((await sql`
        SELECT id, rack_id, name, plant_profile_id, created_at
        FROM trays
        ORDER BY name ASC
      `) as TrayRow[]);

  return rows.map(mapTray);
}

export async function getTray(sql: SqlClient, trayId: string): Promise<Tray | null> {
  const rows = (await sql`
    SELECT id, rack_id, name, plant_profile_id, created_at
    FROM trays
    WHERE id = ${trayId}
  `) as TrayRow[];

  return rows[0] ? mapTray(rows[0]) : null;
}

export async function getLatestSensorReading(
  sql: SqlClient,
  trayId: string,
): Promise<SensorReading | null> {
  const rows = (await sql`
    SELECT tray_id, temperature, humidity, soil_moisture, water_ph, water_level, created_at
    FROM sensor_readings
    WHERE tray_id = ${trayId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as SensorReadingRow[];

  return rows[0] ? mapSensorReading(rows[0]) : null;
}

export async function getSensorHistory(
  sql: SqlClient,
  trayId: string,
  limit = 24,
): Promise<SensorReading[]> {
  const rows = (await sql`
    SELECT tray_id, temperature, humidity, soil_moisture, water_ph, water_level, created_at
    FROM (
      SELECT tray_id, temperature, humidity, soil_moisture, water_ph, water_level, created_at
      FROM sensor_readings
      WHERE tray_id = ${trayId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    ) recent_readings
    ORDER BY created_at ASC
  `) as SensorReadingRow[];

  return rows.map(mapSensorReading);
}

export async function getLatestDeviceState(
  sql: SqlClient,
  trayId: string,
): Promise<DeviceState | null> {
  const rows = (await sql`
    SELECT tray_id, led_status, fan_status, pump_status, reservoir_status
    FROM device_states
    WHERE tray_id = ${trayId}
    ORDER BY updated_at DESC
    LIMIT 1
  `) as DeviceStateRow[];

  return rows[0] ? mapDeviceState(rows[0]) : null;
}

export async function getActivePlantProfile(
  sql: SqlClient,
  trayId: string,
): Promise<PlantProfile | null> {
  const rows = (await sql`
    SELECT
      pp.id,
      pp.crop_name,
      pp.safe_temperature_min,
      pp.safe_temperature_max,
      pp.safe_humidity_min,
      pp.safe_humidity_max,
      pp.safe_soil_moisture_min,
      pp.safe_soil_moisture_max,
      pp.safe_water_ph_min,
      pp.safe_water_ph_max,
      pp.safe_water_level_min,
      pp.safe_water_level_max
    FROM plant_profiles pp
    JOIN trays t ON t.plant_profile_id = pp.id
    WHERE t.id = ${trayId}
    LIMIT 1
  `) as PlantProfileRow[];

  return rows[0] ? mapPlantProfile(rows[0]) : null;
}

export async function getLatestRecommendation(
  sql: SqlClient,
  trayId: string,
): Promise<Recommendation | null> {
  const rows = (await sql`
    SELECT tray_id, title, message, suggested_action, severity, confidence
    FROM recommendations
    WHERE tray_id = ${trayId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as RecommendationRow[];

  return rows[0] ? mapRecommendation(rows[0]) : null;
}

export async function getLatestAutomationSettings(
  sql: SqlClient,
  trayId: string,
): Promise<AutomationSettings | null> {
  const rows = (await sql`
    SELECT
      tray_id,
      mode,
      led_start_time,
      led_end_time,
      led_spectrum,
      fan_trigger_temperature,
      pump_interval_minutes,
      pump_duration_seconds
    FROM automation_profiles
    WHERE tray_id = ${trayId}
    ORDER BY created_at DESC
    LIMIT 1
  `) as AutomationSettingsRow[];

  return rows[0] ? mapAutomationSettings(rows[0]) : null;
}

export async function syncActiveAlerts(
  sql: SqlClient,
  trayId: string,
  alerts: Alert[],
): Promise<void> {
  await sql`
    UPDATE alerts
    SET is_active = false
    WHERE is_active = true AND tray_id = ${trayId}
  `;

  await Promise.all(
    alerts.map((alert) =>
      sql`
        INSERT INTO alerts (tray_id, type, severity, message, created_at, is_active)
        VALUES (
          ${trayId},
          ${alert.type},
          ${alert.severity},
          ${alert.message},
          ${alert.createdAt},
          true
        )
        ON CONFLICT (type, message, created_at) DO UPDATE
        SET
          severity = EXCLUDED.severity,
          is_active = EXCLUDED.is_active
      `,
    ),
  );
}

export async function getDashboardState(
  sql: SqlClient,
  trayId: string,
): Promise<DigitalTwinState> {
  const sensorReading = await getLatestSensorReading(sql, trayId);
  const deviceState = await getLatestDeviceState(sql, trayId);
  const plantProfile = await getActivePlantProfile(sql, trayId);
  const automationSettings = await getLatestAutomationSettings(sql, trayId);

  const safePlantProfile = plantProfile ?? mockPlantProfile;
  const safeSensorReading = sensorReading ?? { ...mockSensorReading, trayId };

  const alerts = generateAlerts(safeSensorReading, safePlantProfile);
  const latestRecommendation = await getLatestRecommendation(sql, trayId);

  await syncActiveAlerts(sql, trayId, alerts);

  return {
    sensorReading: safeSensorReading,
    deviceState: deviceState ?? { ...mockDeviceState, trayId },
    alerts,
    recommendation:
      latestRecommendation ??
      generateRecommendation(safeSensorReading, safePlantProfile),
    automationSettings: automationSettings ?? { ...mockAutomationSettings, trayId },
  };
}

export async function insertDeviceStateSnapshot(
  sql: SqlClient,
  deviceState: DeviceState,
): Promise<DeviceState> {
  const rows = (await sql`
    INSERT INTO device_states (
      tray_id,
      led_status,
      fan_status,
      pump_status,
      reservoir_status
    )
    VALUES (
      ${deviceState.trayId},
      ${deviceState.ledStatus},
      ${deviceState.fanStatus},
      ${deviceState.pumpStatus},
      ${deviceState.reservoirStatus}
    )
    RETURNING tray_id, led_status, fan_status, pump_status, reservoir_status
  `) as DeviceStateRow[];

  if (!rows[0]) {
    throw new Error("Device state insert did not return a row.");
  }

  return mapDeviceState(rows[0]);
}

export function applyDeviceStatus(
  deviceState: DeviceState,
  device: "led" | "fan" | "pump" | "reservoir",
  status: DeviceStatus,
): DeviceState {
  switch (device) {
    case "led":
      return { ...deviceState, ledStatus: status };
    case "fan":
      return { ...deviceState, fanStatus: status };
    case "pump":
      return { ...deviceState, pumpStatus: status };
    case "reservoir":
      return { ...deviceState, reservoirStatus: status };
  }
}

export async function insertRecommendation(
  sql: SqlClient,
  recommendation: Recommendation,
): Promise<Recommendation> {
  const rows = (await sql`
    INSERT INTO recommendations (
      tray_id,
      title,
      message,
      suggested_action,
      severity,
      confidence
    )
    VALUES (
      ${recommendation.trayId},
      ${recommendation.title},
      ${recommendation.message},
      ${recommendation.suggestedAction},
      ${recommendation.severity},
      ${recommendation.confidence}
    )
    RETURNING tray_id, title, message, suggested_action, severity, confidence
  `) as RecommendationRow[];

  if (!rows[0]) {
    throw new Error("Recommendation insert did not return a row.");
  }

  return mapRecommendation(rows[0]);
}

export async function insertAutomationProfile(
  sql: SqlClient,
  settings: AutomationSettings,
): Promise<AutomationSettings> {
  const existing = await sql`
    SELECT id FROM automation_profiles
    WHERE tray_id = ${settings.trayId}
    LIMIT 1
  `;

  let rows: AutomationSettingsRow[];

  if (existing.length > 0) {
    rows = (await sql`
      UPDATE automation_profiles
      SET
        mode = ${settings.mode},
        led_start_time = ${settings.ledStartTime},
        led_end_time = ${settings.ledEndTime},
        led_spectrum = ${settings.ledSpectrum},
        fan_trigger_temperature = ${settings.fanTriggerTemperature},
        pump_interval_minutes = ${settings.pumpIntervalMinutes},
        pump_duration_seconds = ${settings.pumpDurationSeconds},
        created_at = now()
      WHERE tray_id = ${settings.trayId}
      RETURNING tray_id, mode, led_start_time, led_end_time, led_spectrum, fan_trigger_temperature, pump_interval_minutes, pump_duration_seconds
    `) as AutomationSettingsRow[];
  } else {
    rows = (await sql`
      INSERT INTO automation_profiles (
        tray_id,
        mode,
        led_start_time,
        led_end_time,
        led_spectrum,
        fan_trigger_temperature,
        pump_interval_minutes,
        pump_duration_seconds
      )
      VALUES (
        ${settings.trayId},
        ${settings.mode},
        ${settings.ledStartTime},
        ${settings.ledEndTime},
        ${settings.ledSpectrum},
        ${settings.fanTriggerTemperature},
        ${settings.pumpIntervalMinutes},
        ${settings.pumpDurationSeconds}
      )
      RETURNING tray_id, mode, led_start_time, led_end_time, led_spectrum, fan_trigger_temperature, pump_interval_minutes, pump_duration_seconds
    `) as AutomationSettingsRow[];
  }

  if (!rows[0]) {
    throw new Error("Automation profile save did not return a row.");
  }

  return mapAutomationSettings(rows[0]);
}

export async function insertAutomationLog(
  sql: SqlClient,
  event: AutomationEvent,
): Promise<AutomationEvent> {
  const rows = (await sql`
    INSERT INTO automation_logs (
      tray_id,
      device_type,
      action,
      triggered_by,
      message
    )
    VALUES (
      ${event.trayId},
      ${event.device},
      ${event.action},
      ${event.triggeredBy},
      ${event.message}
    )
    RETURNING tray_id, device_type, action, triggered_by, message, executed_at
  `) as AutomationLogRow[];

  if (!rows[0]) {
    throw new Error("Automation log insert did not return a row.");
  }

  return mapAutomationEvent(rows[0]);
}
