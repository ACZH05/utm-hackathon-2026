export type DeviceStatus = "normal" | "warning" | "critical" | "off" | "on";

export type AlertSeverity = "info" | "warning" | "critical";

export interface SensorReading {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterPh: number;
  waterLevel: number;
  createdAt: string;
}

export interface DeviceState {
  ledStatus: DeviceStatus;
  fanStatus: DeviceStatus;
  pumpStatus: DeviceStatus;
  reservoirStatus: DeviceStatus;
}

export interface Alert {
  type: string;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
}

export interface Recommendation {
  title: string;
  message: string;
  suggestedAction: string;
  severity: AlertSeverity;
  confidence: number;
}

export interface PlantProfile {
  cropName: string;
  safeTemperatureRange: [number, number];
  safeHumidityRange: [number, number];
  safeSoilMoistureRange: [number, number];
  safeWaterPhRange: [number, number];
  safeWaterLevelRange: [number, number];
}

export interface DigitalTwinState {
  sensorReading: SensorReading;
  deviceState: DeviceState;
  alerts: Alert[];
  recommendation: Recommendation;
}

export interface SelectedComponent {
  type: "plant" | "led" | "fan" | "pump" | "reservoir";
  name: string;
}
