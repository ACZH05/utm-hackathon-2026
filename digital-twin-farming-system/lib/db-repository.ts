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
  Recommendation,
  SensorReading,
} from "./types";
import type { SqlClient } from "./db";
import {
  mapAutomationEvent,
  mapAutomationSettings,
  mapDeviceState,
  mapPlantProfile,
  mapRecommendation,
  mapSensorReading,
  type AutomationLogRow,
  type AutomationSettingsRow,
  type DeviceStateRow,
  type PlantProfileRow,
  type RecommendationRow,
  type SensorReadingRow,
} from "./db-mappers";

export async function getLatestSensorReading(
  sql: SqlClient,
): Promise<SensorReading | null> {
  const rows = (await sql`
    SELECT temperature, humidity, soil_moisture, water_ph, water_level, created_at
    FROM sensor_readings
    ORDER BY created_at DESC
    LIMIT 1
  `) as SensorReadingRow[];

  return rows[0] ? mapSensorReading(rows[0]) : null;
}

export async function getSensorHistory(
  sql: SqlClient,
  limit = 24,
): Promise<SensorReading[]> {
  const rows = (await sql`
    SELECT temperature, humidity, soil_moisture, water_ph, water_level, created_at
    FROM (
      SELECT temperature, humidity, soil_moisture, water_ph, water_level, created_at
      FROM sensor_readings
      ORDER BY created_at DESC
      LIMIT ${limit}
    ) recent_readings
    ORDER BY created_at ASC
  `) as SensorReadingRow[];

  return rows.map(mapSensorReading);
}

export async function getLatestDeviceState(sql: SqlClient): Promise<DeviceState | null> {
  const rows = (await sql`
    SELECT led_status, fan_status, pump_status, reservoir_status
    FROM device_states
    ORDER BY updated_at DESC
    LIMIT 1
  `) as DeviceStateRow[];

  return rows[0] ? mapDeviceState(rows[0]) : null;
}

export async function getActivePlantProfile(sql: SqlClient): Promise<PlantProfile | null> {
  const rows = (await sql`
    SELECT
      crop_name,
      safe_temperature_min,
      safe_temperature_max,
      safe_humidity_min,
      safe_humidity_max,
      safe_soil_moisture_min,
      safe_soil_moisture_max,
      safe_water_ph_min,
      safe_water_ph_max,
      safe_water_level_min,
      safe_water_level_max
    FROM plant_profiles
    WHERE is_active = true
    ORDER BY updated_at DESC
    LIMIT 1
  `) as PlantProfileRow[];

  return rows[0] ? mapPlantProfile(rows[0]) : null;
}

export async function getLatestRecommendation(
  sql: SqlClient,
): Promise<Recommendation | null> {
  const rows = (await sql`
    SELECT title, message, suggested_action, severity, confidence
    FROM recommendations
    ORDER BY created_at DESC
    LIMIT 1
  `) as RecommendationRow[];

  return rows[0] ? mapRecommendation(rows[0]) : null;
}

export async function getLatestAutomationSettings(
  sql: SqlClient,
): Promise<AutomationSettings | null> {
  const rows = (await sql`
    SELECT
      mode,
      led_start_time,
      led_end_time,
      led_spectrum,
      fan_trigger_temperature,
      pump_interval_minutes,
      pump_duration_seconds
    FROM automation_profiles
    ORDER BY created_at DESC
    LIMIT 1
  `) as AutomationSettingsRow[];

  return rows[0] ? mapAutomationSettings(rows[0]) : null;
}

export async function syncActiveAlerts(
  sql: SqlClient,
  alerts: Alert[],
): Promise<void> {
  await sql`
    UPDATE alerts
    SET is_active = false
    WHERE is_active = true
  `;

  await Promise.all(
    alerts.map((alert) =>
      sql`
        INSERT INTO alerts (type, severity, message, created_at, is_active)
        VALUES (
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

export async function getDashboardState(sql: SqlClient): Promise<DigitalTwinState> {
  const sensorReading = await getLatestSensorReading(sql);
  const deviceState = await getLatestDeviceState(sql);
  const plantProfile = await getActivePlantProfile(sql);
  const automationSettings = await getLatestAutomationSettings(sql);

  if (!sensorReading) {
    throw new Error("No sensor readings found. Run db/migrations/001_init.sql first.");
  }

  const safePlantProfile = plantProfile ?? mockPlantProfile;
  const alerts = generateAlerts(sensorReading, safePlantProfile);
  const latestRecommendation = await getLatestRecommendation(sql);

  await syncActiveAlerts(sql, alerts);

  return {
    sensorReading,
    deviceState: deviceState ?? mockDeviceState,
    alerts,
    recommendation:
      latestRecommendation ?? generateRecommendation(sensorReading, safePlantProfile),
    automationSettings: automationSettings ?? mockAutomationSettings,
  };
}

export async function insertDeviceStateSnapshot(
  sql: SqlClient,
  deviceState: DeviceState,
): Promise<DeviceState> {
  const rows = (await sql`
    INSERT INTO device_states (
      led_status,
      fan_status,
      pump_status,
      reservoir_status
    )
    VALUES (
      ${deviceState.ledStatus},
      ${deviceState.fanStatus},
      ${deviceState.pumpStatus},
      ${deviceState.reservoirStatus}
    )
    RETURNING led_status, fan_status, pump_status, reservoir_status
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
      title,
      message,
      suggested_action,
      severity,
      confidence
    )
    VALUES (
      ${recommendation.title},
      ${recommendation.message},
      ${recommendation.suggestedAction},
      ${recommendation.severity},
      ${recommendation.confidence}
    )
    RETURNING title, message, suggested_action, severity, confidence
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
  const rows = (await sql`
    INSERT INTO automation_profiles (
      mode,
      led_start_time,
      led_end_time,
      led_spectrum,
      fan_trigger_temperature,
      pump_interval_minutes,
      pump_duration_seconds
    )
    VALUES (
      ${settings.mode},
      ${settings.ledStartTime},
      ${settings.ledEndTime},
      ${settings.ledSpectrum},
      ${settings.fanTriggerTemperature},
      ${settings.pumpIntervalMinutes},
      ${settings.pumpDurationSeconds}
    )
    RETURNING mode, led_start_time, led_end_time, led_spectrum, fan_trigger_temperature, pump_interval_minutes, pump_duration_seconds
  `) as AutomationSettingsRow[];

  if (!rows[0]) {
    throw new Error("Automation profile insert did not return a row.");
  }

  return mapAutomationSettings(rows[0]);
}

export async function insertAutomationLog(
  sql: SqlClient,
  event: AutomationEvent,
): Promise<AutomationEvent> {
  const rows = (await sql`
    INSERT INTO automation_logs (
      device_type,
      action,
      triggered_by,
      message
    )
    VALUES (
      ${event.device},
      ${event.action},
      ${event.triggeredBy},
      ${event.message}
    )
    RETURNING device_type, action, triggered_by, message, executed_at
  `) as AutomationLogRow[];

  if (!rows[0]) {
    throw new Error("Automation log insert did not return a row.");
  }

  return mapAutomationEvent(rows[0]);
}
