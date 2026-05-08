import type {
  Alert,
  AlertSeverity,
  AutomationEvent,
  AutomationMode,
  AutomationSettings,
  DeviceState,
  DeviceStatus,
  PlantProfile,
  Rack,
  Recommendation,
  SensorReading,
  Tray,
} from "./types";

const deviceStatuses = ["normal", "warning", "critical", "off", "on"] as const;
const alertSeverities = ["info", "warning", "critical"] as const;
const automationModes = ["manual", "ai"] as const;
const ledSpectrums = ["blue", "red", "white", "mixed"] as const;

export interface RackRow {
  id: unknown;
  name: unknown;
  created_at: unknown;
}

export interface TrayRow {
  id: unknown;
  rack_id: unknown;
  name: unknown;
  plant_profile_id: unknown;
  created_at: unknown;
}

export interface SensorReadingRow {
  tray_id: unknown;
  temperature: unknown;
  humidity: unknown;
  soil_moisture: unknown;
  water_ph: unknown;
  water_level: unknown;
  created_at: unknown;
}

export interface DeviceStateRow {
  tray_id: unknown;
  led_status: unknown;
  fan_status: unknown;
  pump_status: unknown;
  reservoir_status: unknown;
}

export interface AlertRow {
  tray_id: unknown;
  type: unknown;
  severity: unknown;
  message: unknown;
  created_at: unknown;
}

export interface RecommendationRow {
  tray_id: unknown;
  title: unknown;
  message: unknown;
  suggested_action: unknown;
  severity: unknown;
  confidence: unknown;
}

export interface PlantProfileRow {
  id: unknown;
  crop_name: unknown;
  safe_temperature_min: unknown;
  safe_temperature_max: unknown;
  safe_humidity_min: unknown;
  safe_humidity_max: unknown;
  safe_soil_moisture_min: unknown;
  safe_soil_moisture_max: unknown;
  safe_water_ph_min: unknown;
  safe_water_ph_max: unknown;
  safe_water_level_min: unknown;
  safe_water_level_max: unknown;
}

export interface AutomationSettingsRow {
  tray_id: unknown;
  mode: unknown;
  led_start_time: unknown;
  led_end_time: unknown;
  led_spectrum: unknown;
  fan_trigger_temperature: unknown;
  pump_interval_minutes: unknown;
  pump_duration_seconds: unknown;
}

export interface AutomationLogRow {
  tray_id: unknown;
  led_status: unknown;
  fan_status: unknown;
  pump_status: unknown;
  triggered_by: unknown;
  message: unknown;
  executed_at: unknown;
}

function toNumber(value: unknown): number {
  const parsedValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Expected numeric database value, received ${String(value)}`);
  }

  return parsedValue;
}

function toString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value !== "string" && typeof value !== "number" && typeof value !== "bigint") {
    throw new Error(`Expected text database value, received ${String(value)}`);
  }

  return String(value);
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "string") {
    return new Date(value).toISOString();
  }

  throw new Error(`Expected timestamp database value, received ${String(value)}`);
}

function toDeviceStatus(value: unknown): DeviceStatus {
  const status = toString(value);

  if (!deviceStatuses.includes(status as DeviceStatus)) {
    throw new Error(`Unexpected device status: ${status}`);
  }

  return status as DeviceStatus;
}

function toAlertSeverity(value: unknown): AlertSeverity {
  const severity = toString(value);

  if (!alertSeverities.includes(severity as AlertSeverity)) {
    throw new Error(`Unexpected alert severity: ${severity}`);
  }

  return severity as AlertSeverity;
}

function toAutomationMode(value: unknown): AutomationMode {
  const mode = toString(value);

  if (!automationModes.includes(mode as AutomationMode)) {
    throw new Error(`Unexpected automation mode: ${mode}`);
  }

  return mode as AutomationMode;
}

function toLedSpectrum(value: unknown): "blue" | "red" | "white" | "mixed" {
  const spectrum = toString(value);

  if (!ledSpectrums.includes(spectrum as "blue" | "red" | "white" | "mixed")) {
    throw new Error(`Unexpected LED spectrum: ${spectrum}`);
  }

  return spectrum as "blue" | "red" | "white" | "mixed";
}

export function mapRack(row: RackRow): Rack {
  return {
    id: toString(row.id),
    name: toString(row.name),
    createdAt: toIsoString(row.created_at),
  };
}

export function mapTray(row: TrayRow): Tray {
  return {
    id: toString(row.id),
    rackId: toString(row.rack_id),
    name: toString(row.name),
    plantProfileId: row.plant_profile_id ? toString(row.plant_profile_id) : undefined,
    createdAt: toIsoString(row.created_at),
  };
}

export function mapSensorReading(row: SensorReadingRow): SensorReading {
  return {
    trayId: toString(row.tray_id),
    temperature: toNumber(row.temperature),
    humidity: toNumber(row.humidity),
    soilMoisture: toNumber(row.soil_moisture),
    waterPh: toNumber(row.water_ph),
    waterLevel: toNumber(row.water_level),
    createdAt: toIsoString(row.created_at),
  };
}

export function mapDeviceState(row: DeviceStateRow): DeviceState {
  return {
    trayId: toString(row.tray_id),
    ledStatus: toDeviceStatus(row.led_status),
    fanStatus: toDeviceStatus(row.fan_status),
    pumpStatus: toDeviceStatus(row.pump_status),
    reservoirStatus: toDeviceStatus(row.reservoir_status),
  };
}

export function mapAlert(row: AlertRow): Alert {
  return {
    trayId: toString(row.tray_id),
    type: toString(row.type),
    severity: toAlertSeverity(row.severity),
    message: toString(row.message),
    createdAt: toIsoString(row.created_at),
  };
}

export function mapRecommendation(row: RecommendationRow): Recommendation {
  return {
    trayId: toString(row.tray_id),
    title: toString(row.title),
    message: toString(row.message),
    suggestedAction: toString(row.suggested_action),
    severity: toAlertSeverity(row.severity),
    confidence: toNumber(row.confidence),
  };
}

export function mapPlantProfile(row: PlantProfileRow): PlantProfile {
  return {
    id: toString(row.id),
    cropName: toString(row.crop_name),
    safeTemperatureRange: [
      toNumber(row.safe_temperature_min),
      toNumber(row.safe_temperature_max),
    ],
    safeHumidityRange: [
      toNumber(row.safe_humidity_min),
      toNumber(row.safe_humidity_max),
    ],
    safeSoilMoistureRange: [
      toNumber(row.safe_soil_moisture_min),
      toNumber(row.safe_soil_moisture_max),
    ],
    safeWaterPhRange: [toNumber(row.safe_water_ph_min), toNumber(row.safe_water_ph_max)],
    safeWaterLevelRange: [
      toNumber(row.safe_water_level_min),
      toNumber(row.safe_water_level_max),
    ],
  };
}

export function mapAutomationSettings(row: AutomationSettingsRow): AutomationSettings {
  return {
    trayId: toString(row.tray_id),
    mode: toAutomationMode(row.mode),
    ledStartTime: toString(row.led_start_time),
    ledEndTime: toString(row.led_end_time),
    ledSpectrum: toLedSpectrum(row.led_spectrum),
    fanTriggerTemperature: toNumber(row.fan_trigger_temperature),
    pumpIntervalMinutes: toNumber(row.pump_interval_minutes),
    pumpDurationSeconds: toNumber(row.pump_duration_seconds),
  };
}

export function mapAutomationEvent(row: AutomationLogRow): AutomationEvent {
  const triggeredBy = toString(row.triggered_by);

  return {
    trayId: toString(row.tray_id),
    ledStatus: row.led_status ? toDeviceStatus(row.led_status) : undefined,
    fanStatus: row.fan_status ? toDeviceStatus(row.fan_status) : undefined,
    pumpStatus: row.pump_status ? toDeviceStatus(row.pump_status) : undefined,
    triggeredBy: triggeredBy as "manual" | "ai" | "simulation",
    message: row.message ? toString(row.message) : "",
    createdAt: toIsoString(row.executed_at),
  };
}
