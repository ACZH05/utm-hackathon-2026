import type {
  Alert,
  DeviceState,
  DigitalTwinState,
  PlantProfile,
  Recommendation,
  SensorReading,
} from "./types";

export const mockPlantProfile: PlantProfile = {
  cropName: "Lettuce",
  safeTemperatureRange: [18, 26],
  safeHumidityRange: [50, 75],
  safeSoilMoistureRange: [45, 70],
  safeWaterPhRange: [5.8, 6.8],
  safeWaterLevelRange: [35, 100],
};

export const mockSensorReading: SensorReading = {
  temperature: 31.8,
  humidity: 67,
  soilMoisture: 58,
  waterPh: 6.3,
  waterLevel: 72,
  createdAt: "2026-05-05T08:20:00.000Z",
};

export const mockSensorHistory: SensorReading[] = [
  {
    temperature: 24.1,
    humidity: 62,
    soilMoisture: 64,
    waterPh: 6.2,
    waterLevel: 83,
    createdAt: "2026-05-05T01:00:00.000Z",
  },
  {
    temperature: 24.8,
    humidity: 63,
    soilMoisture: 63,
    waterPh: 6.2,
    waterLevel: 81,
    createdAt: "2026-05-05T02:00:00.000Z",
  },
  {
    temperature: 25.6,
    humidity: 64,
    soilMoisture: 61,
    waterPh: 6.3,
    waterLevel: 79,
    createdAt: "2026-05-05T03:00:00.000Z",
  },
  {
    temperature: 26.9,
    humidity: 65,
    soilMoisture: 60,
    waterPh: 6.3,
    waterLevel: 77,
    createdAt: "2026-05-05T04:00:00.000Z",
  },
  {
    temperature: 28.4,
    humidity: 66,
    soilMoisture: 59,
    waterPh: 6.3,
    waterLevel: 75,
    createdAt: "2026-05-05T05:00:00.000Z",
  },
  {
    temperature: 29.6,
    humidity: 67,
    soilMoisture: 58,
    waterPh: 6.4,
    waterLevel: 74,
    createdAt: "2026-05-05T06:00:00.000Z",
  },
  {
    temperature: 30.5,
    humidity: 67,
    soilMoisture: 58,
    waterPh: 6.4,
    waterLevel: 73,
    createdAt: "2026-05-05T07:00:00.000Z",
  },
  mockSensorReading,
];

export const mockDeviceState: DeviceState = {
  ledStatus: "on",
  fanStatus: "off",
  pumpStatus: "normal",
  reservoirStatus: "normal",
};

export function generateAlerts(
  sensorReading: SensorReading,
  plantProfile: PlantProfile,
): Alert[] {
  const alerts: Alert[] = [];
  const createdAt = sensorReading.createdAt;
  const [
    safeTemperatureMinimum,
    safeTemperatureMaximum,
  ] = plantProfile.safeTemperatureRange;
  const [safeSoilMoistureMinimum] = plantProfile.safeSoilMoistureRange;
  const [
    safeWaterPhMinimum,
    safeWaterPhMaximum,
  ] = plantProfile.safeWaterPhRange;
  const [safeWaterLevelMinimum] = plantProfile.safeWaterLevelRange;

  if (sensorReading.waterLevel < safeWaterLevelMinimum) {
    alerts.push({
      type: "water-level",
      severity: "critical",
      message: `Water level is below the ${plantProfile.cropName} safe minimum of ${safeWaterLevelMinimum}%.`,
      createdAt,
    });
  }

  if (sensorReading.temperature > safeTemperatureMaximum) {
    alerts.push({
      type: "temperature",
      severity: "warning",
      message: `Temperature is above the ${plantProfile.cropName} safe range of ${safeTemperatureMinimum}-${safeTemperatureMaximum}°C.`,
      createdAt,
    });
  }

  if (sensorReading.temperature < safeTemperatureMinimum) {
    alerts.push({
      type: "temperature",
      severity: "warning",
      message: `Temperature is below the ${plantProfile.cropName} safe range of ${safeTemperatureMinimum}-${safeTemperatureMaximum}°C.`,
      createdAt,
    });
  }

  if (sensorReading.soilMoisture < safeSoilMoistureMinimum) {
    alerts.push({
      type: "soil-moisture",
      severity: "warning",
      message: `Soil moisture is below the ${plantProfile.cropName} safe minimum of ${safeSoilMoistureMinimum}%.`,
      createdAt,
    });
  }

  if (
    sensorReading.waterPh < safeWaterPhMinimum ||
    sensorReading.waterPh > safeWaterPhMaximum
  ) {
    alerts.push({
      type: "water-ph",
      severity: "warning",
      message: `Water pH is outside the ${plantProfile.cropName} safe range of ${safeWaterPhMinimum}-${safeWaterPhMaximum}.`,
      createdAt,
    });
  }

  return alerts;
}

export function generateRecommendation(
  sensorReading: SensorReading,
  plantProfile: PlantProfile,
): Recommendation {
  const [, safeTemperatureMaximum] = plantProfile.safeTemperatureRange;
  const [safeSoilMoistureMinimum] = plantProfile.safeSoilMoistureRange;
  const [safeWaterPhMinimum, safeWaterPhMaximum] =
    plantProfile.safeWaterPhRange;
  const [safeWaterLevelMinimum] = plantProfile.safeWaterLevelRange;

  if (sensorReading.waterLevel < safeWaterLevelMinimum) {
    return {
      title: "Refill water reservoir",
      message: `${plantProfile.cropName} water level is below the safe minimum. Refill the reservoir before running another irrigation cycle.`,
      suggestedAction: "Refill reservoir",
      severity: "critical",
      confidence: 0.91,
    };
  }

  if (sensorReading.temperature > safeTemperatureMaximum) {
    return {
      title: "Turn on cooling fan",
      message: `${plantProfile.cropName} rack temperature is too high. Turn on the fan to bring the rack back into the safe range.`,
      suggestedAction: "Set fan status to on",
      severity: "warning",
      confidence: 0.86,
    };
  }

  if (sensorReading.soilMoisture < safeSoilMoistureMinimum) {
    return {
      title: "Run water pump",
      message: `${plantProfile.cropName} soil moisture is below the safe minimum. Run a short watering cycle to recover moisture levels.`,
      suggestedAction: "Set pump status to on",
      severity: "warning",
      confidence: 0.84,
    };
  }

  if (
    sensorReading.waterPh < safeWaterPhMinimum ||
    sensorReading.waterPh > safeWaterPhMaximum
  ) {
    return {
      title: "Adjust nutrient pH",
      message: `${plantProfile.cropName} water pH is outside the safe range. Check the reservoir and adjust the nutrient mixture.`,
      suggestedAction: "Inspect reservoir pH",
      severity: "warning",
      confidence: 0.82,
    };
  }

  return {
    title: "Conditions stable",
    message: `${plantProfile.cropName} readings are within the safe operating ranges. Continue monitoring the rack.`,
    suggestedAction: "Keep current device settings",
    severity: "info",
    confidence: 0.78,
  };
}

export const mockDigitalTwinState: DigitalTwinState = {
  sensorReading: mockSensorReading,
  deviceState: mockDeviceState,
  alerts: generateAlerts(mockSensorReading, mockPlantProfile),
  recommendation: generateRecommendation(mockSensorReading, mockPlantProfile),
};
