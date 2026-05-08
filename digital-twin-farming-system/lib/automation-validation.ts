import type {
  AIAutomationRecommendation,
  AutomationSettings,
  PlantProfile,
  SensorReading,
} from "./types";

const ledSpectrums = ["blue", "red", "white", "mixed"] as const;
const automationModes = ["manual", "ai"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isTime(value: unknown): value is string {
  return typeof value === "string" && /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
}

function isNumberRange(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    isNumber(value[0]) &&
    isNumber(value[1])
  );
}

function isLedSpectrum(value: unknown): value is AutomationSettings["ledSpectrum"] {
  return typeof value === "string" && ledSpectrums.includes(value as never);
}

function isAutomationMode(value: unknown): value is AutomationSettings["mode"] {
  return typeof value === "string" && automationModes.includes(value as never);
}

export function parseAutomationSettings(value: unknown): AutomationSettings | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.trayId !== "string" ||
    !isAutomationMode(value.mode) ||
    !isTime(value.ledStartTime) ||
    !isTime(value.ledEndTime) ||
    !isLedSpectrum(value.ledSpectrum) ||
    !isNumber(value.fanTriggerTemperature) ||
    !isNumber(value.pumpIntervalMinutes) ||
    !isNumber(value.pumpDurationSeconds)
  ) {
    return null;
  }

  if (value.pumpIntervalMinutes <= 0 || value.pumpDurationSeconds <= 0) {
    return null;
  }

  return {
    trayId: value.trayId,
    mode: value.mode,
    ledStartTime: value.ledStartTime,
    ledEndTime: value.ledEndTime,
    ledSpectrum: value.ledSpectrum as "blue" | "red" | "white" | "mixed",
    fanTriggerTemperature: value.fanTriggerTemperature,
    pumpIntervalMinutes: value.pumpIntervalMinutes,
    pumpDurationSeconds: value.pumpDurationSeconds,
  };
}

export function parseAutomationRecommendation(
  value: unknown,
): AIAutomationRecommendation | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.trayId !== "string" ||
    typeof value.cropName !== "string" ||
    !isTime(value.ledStartTime) ||
    !isTime(value.ledEndTime) ||
    !isLedSpectrum(value.ledSpectrum) ||
    !isNumber(value.fanTriggerTemperature) ||
    !isNumber(value.pumpIntervalMinutes) ||
    !isNumber(value.pumpDurationSeconds) ||
    !isNumber(value.confidence)
  ) {
    return null;
  }

  if (
    value.pumpIntervalMinutes <= 0 ||
    value.pumpDurationSeconds <= 0 ||
    value.confidence < 0 ||
    value.confidence > 1
  ) {
    return null;
  }

  return {
    trayId: value.trayId,
    cropName: value.cropName,
    ledStartTime: value.ledStartTime,
    ledEndTime: value.ledEndTime,
    ledSpectrum: value.ledSpectrum as "blue" | "red" | "white" | "mixed",
    fanTriggerTemperature: value.fanTriggerTemperature,
    pumpIntervalMinutes: value.pumpIntervalMinutes,
    pumpDurationSeconds: value.pumpDurationSeconds,
    confidence: value.confidence,
  };
}

export function parseSensorReading(value: unknown): SensorReading | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.trayId !== "string" ||
    !isNumber(value.temperature) ||
    !isNumber(value.humidity) ||
    !isNumber(value.soilMoisture) ||
    !isNumber(value.waterPh) ||
    !isNumber(value.waterLevel) ||
    typeof value.createdAt !== "string"
  ) {
    return null;
  }

  return {
    trayId: value.trayId,
    temperature: value.temperature,
    humidity: value.humidity,
    soilMoisture: value.soilMoisture,
    waterPh: value.waterPh,
    waterLevel: value.waterLevel,
    createdAt: value.createdAt,
  };
}

export function parsePlantProfile(value: unknown): PlantProfile | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.cropName !== "string" ||
    !isNumberRange(value.safeTemperatureRange) ||
    !isNumberRange(value.safeHumidityRange) ||
    !isNumberRange(value.safeSoilMoistureRange) ||
    !isNumberRange(value.safeWaterPhRange) ||
    !isNumberRange(value.safeWaterLevelRange)
  ) {
    return null;
  }

  return {
    cropName: value.cropName,
    safeTemperatureRange: value.safeTemperatureRange,
    safeHumidityRange: value.safeHumidityRange,
    safeSoilMoistureRange: value.safeSoilMoistureRange,
    safeWaterPhRange: value.safeWaterPhRange,
    safeWaterLevelRange: value.safeWaterLevelRange,
  };
}

export function parseMockCurrentTime(value: unknown): string | null {
  return isTime(value) ? value : null;
}
