export type DeviceStatus = "normal" | "warning" | "critical" | "off" | "on";

export type AlertSeverity = "info" | "warning" | "critical";

export type AutomationMode = "manual" | "ai";

export interface Rack {
  id: string;
  name: string;
  createdAt: string;
}

export interface Tray {
  id: string;
  rackId: string;
  name: string;
  plantProfileId?: string;
  createdAt: string;
}

export interface SensorReading {
  trayId: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterPh: number;
  waterLevel: number;
  createdAt: string;
}

export interface DeviceState {
  trayId: string;
  ledStatus: DeviceStatus;
  fanStatus: DeviceStatus;
  pumpStatus: DeviceStatus;
  reservoirStatus: DeviceStatus;
}

export interface Alert {
  trayId: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
}

export interface Recommendation {
  trayId: string;
  title: string;
  message: string;
  suggestedAction: string;
  severity: AlertSeverity;
  confidence: number;
}

export interface PlantProfile {
  id: string;
  cropName: string;
  safeTemperatureRange: [number, number];
  safeHumidityRange: [number, number];
  safeSoilMoistureRange: [number, number];
  safeWaterPhRange: [number, number];
  safeWaterLevelRange: [number, number];
}

export interface AutomationSettings {
  trayId: string;
  mode: AutomationMode;
  ledStartTime: string;
  ledEndTime: string;
  ledSpectrum: "blue" | "red" | "white" | "mixed";
  fanTriggerTemperature: number;
  pumpIntervalMinutes: number;
  pumpDurationSeconds: number;
}

export interface AIAutomationRecommendation {
  trayId: string;
  cropName: string;
  ledStartTime: string;
  ledEndTime: string;
  ledSpectrum: "blue" | "red" | "white" | "mixed";
  fanTriggerTemperature: number;
  pumpIntervalMinutes: number;
  pumpDurationSeconds: number;
  confidence: number;
}

export interface AutomationEvent {
  trayId: string;
  ledStatus?: DeviceStatus;
  fanStatus?: DeviceStatus;
  pumpStatus?: DeviceStatus;
  triggeredBy: "manual" | "ai" | "simulation";
  message: string;
  createdAt: string;
}

export interface SelectedComponent {
  type: "plant" | "led" | "fan" | "pump" | "reservoir";
  name: string;
}

export interface DigitalTwinState {
  sensorReading: SensorReading;
  deviceState: DeviceState;
  alerts: Alert[];
  recommendation: Recommendation;
  automationSettings?: AutomationSettings;
}
