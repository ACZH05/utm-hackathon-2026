import {
  applyAutomationRecommendation,
  generateAlerts,
  generateAutomationRecommendation,
  generateRecommendation,
  mockAutomationSettings,
  mockDeviceState,
  mockPlantProfile,
  mockSensorReading,
  simulateAutomation,
} from "./mock-data";
import type {
  AIAutomationRecommendation,
  AutomationEvent,
  AutomationSettings,
  DeviceState,
  DeviceStatus,
  DigitalTwinState,
  PlantProfile,
  SensorReading,
} from "./types";

let currentSensorReading: SensorReading = mockSensorReading;
let currentPlantProfile: PlantProfile = mockPlantProfile;
let currentDeviceState: DeviceState = mockDeviceState;
let currentAutomationSettings: AutomationSettings = mockAutomationSettings;
let latestAutomationRecommendation: AIAutomationRecommendation | null = null;
const automationLogs: AutomationEvent[] = [];

function applyMockDeviceStatus(
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

export function getMockDashboardState(): DigitalTwinState {
  return {
    sensorReading: currentSensorReading,
    deviceState: currentDeviceState,
    alerts: generateAlerts(currentSensorReading, currentPlantProfile),
    recommendation: generateRecommendation(currentSensorReading, currentPlantProfile),
    automationSettings: currentAutomationSettings,
  };
}

export function getMockPlantProfile(): PlantProfile {
  return currentPlantProfile;
}

export function getMockAutomationLogs(trayId: string, limit = 10): AutomationEvent[] {
  return automationLogs
    .filter((log) => log.trayId === trayId)
    .slice(-limit)
    .reverse();
}

export function saveMockAutomationSettings(
  automationSettings: AutomationSettings,
): AutomationSettings {
  currentAutomationSettings = automationSettings;
  latestAutomationRecommendation = null;

  const event: AutomationEvent = {
    trayId: automationSettings.trayId,
    ledStatus: "on",
    fanStatus: "off",
    pumpStatus: "off",
    triggeredBy: "manual",
    message: "Manual automation profile saved for LED, fan, and pump.",
    createdAt: new Date().toISOString(),
  };
  automationLogs.push(event);

  return currentAutomationSettings;
}

export function generateMockAutomationRecommendation(
  sensorReading = currentSensorReading,
  plantProfile = currentPlantProfile,
): AIAutomationRecommendation {
  currentSensorReading = sensorReading;
  currentPlantProfile = plantProfile;
  latestAutomationRecommendation = generateAutomationRecommendation(
    currentSensorReading,
    currentPlantProfile,
  );

  return latestAutomationRecommendation;
}

export function applyMockAutomationRecommendation(
  aiAutomationRecommendation: AIAutomationRecommendation,
): AutomationSettings {
  latestAutomationRecommendation = aiAutomationRecommendation;
  currentAutomationSettings = applyAutomationRecommendation(aiAutomationRecommendation);

  const event: AutomationEvent = {
    trayId: aiAutomationRecommendation.trayId,
    ledStatus: "on",
    fanStatus: "off",
    pumpStatus: "off",
    triggeredBy: "ai",
    message: `AI-assisted automation profile applied for ${aiAutomationRecommendation.cropName}.`,
    createdAt: new Date().toISOString(),
  };
  automationLogs.push(event);

  return currentAutomationSettings;
}

export function runMockAutomationSimulation(
  sensorReading = currentSensorReading,
  automationSettings = currentAutomationSettings,
  mockCurrentTime: string,
): { deviceState: DeviceState; automationEvent?: AutomationEvent } {
  currentSensorReading = sensorReading;
  currentAutomationSettings = automationSettings;

  const result = simulateAutomation(
    currentSensorReading,
    currentAutomationSettings,
    currentDeviceState,
    mockCurrentTime,
  );

  currentDeviceState = result.deviceState;
  if (result.automationEvent) {
    automationLogs.push(result.automationEvent);
  }

  return {
    deviceState: currentDeviceState,
    automationEvent: result.automationEvent ?? undefined,
  };
}

export function updateMockDeviceStatus(
  device: "led" | "fan" | "pump" | "reservoir",
  status: DeviceStatus,
): DeviceState {
  currentDeviceState = applyMockDeviceStatus(currentDeviceState, device, status);

  return currentDeviceState;
}

export function getLatestAutomationRecommendation() {
  return latestAutomationRecommendation;
}

export function getLatestAutomationEvent() {
  return automationLogs.length > 0 ? automationLogs[automationLogs.length - 1] : null;
}
