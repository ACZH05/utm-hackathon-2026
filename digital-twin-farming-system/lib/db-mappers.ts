import type {
  Alert,
  AlertSeverity,
  DeviceState,
  DeviceStatus,
  PlantProfile,
  Recommendation,
  SensorReading,
} from "./types";

const deviceStatuses = ["normal", "warning", "critical", "off", "on"] as const;
const alertSeverities = ["info", "warning", "critical"] as const;

export interface SensorReadingRow {
  temperature: unknown;
  humidity: unknown;
  soil_moisture: unknown;
  water_ph: unknown;
  water_level: unknown;
  created_at: unknown;
}

export interface DeviceStateRow {
  led_status: unknown;
  fan_status: unknown;
  pump_status: unknown;
  reservoir_status: unknown;
}

export interface AlertRow {
  type: unknown;
  severity: unknown;
  message: unknown;
  created_at: unknown;
}

export interface RecommendationRow {
  title: unknown;
  message: unknown;
  suggested_action: unknown;
  severity: unknown;
  confidence: unknown;
}

export interface PlantProfileRow {
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

function toNumber(value: unknown): number {
  const parsedValue =
    typeof value === "number" ? value : typeof value === "string" ? Number(value) : NaN;

  if (!Number.isFinite(parsedValue)) {
    throw new Error(`Expected numeric database value, received ${String(value)}`);
  }

  return parsedValue;
}

function toString(value: unknown): string {
  if (typeof value !== "string") {
    throw new Error(`Expected text database value, received ${String(value)}`);
  }

  return value;
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

export function mapSensorReading(row: SensorReadingRow): SensorReading {
  return {
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
    ledStatus: toDeviceStatus(row.led_status),
    fanStatus: toDeviceStatus(row.fan_status),
    pumpStatus: toDeviceStatus(row.pump_status),
    reservoirStatus: toDeviceStatus(row.reservoir_status),
  };
}

export function mapAlert(row: AlertRow): Alert {
  return {
    type: toString(row.type),
    severity: toAlertSeverity(row.severity),
    message: toString(row.message),
    createdAt: toIsoString(row.created_at),
  };
}

export function mapRecommendation(row: RecommendationRow): Recommendation {
  return {
    title: toString(row.title),
    message: toString(row.message),
    suggestedAction: toString(row.suggested_action),
    severity: toAlertSeverity(row.severity),
    confidence: toNumber(row.confidence),
  };
}

export function mapPlantProfile(row: PlantProfileRow): PlantProfile {
  return {
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
