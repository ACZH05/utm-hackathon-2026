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
let latestAutomationEvent: AutomationEvent | null = null;

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

export function saveMockAutomationSettings(
  automationSettings: AutomationSettings,
): AutomationSettings {
  currentAutomationSettings = automationSettings;
  latestAutomationRecommendation = null;
  latestAutomationEvent = {
    device: "led",
    action: "on",
    triggeredBy: "manual",
    message: "Manual automation profile saved for LED, fan, and pump.",
    createdAt: new Date().toISOString(),
  };

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
  latestAutomationEvent = {
    device: "led",
    action: "on",
    triggeredBy: "ai",
    message: `AI-assisted automation profile applied for ${aiAutomationRecommendation.cropName}.`,
    createdAt: new Date().toISOString(),
  };

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
  latestAutomationEvent = result.automationEvent ?? latestAutomationEvent;

  return {
    deviceState: currentDeviceState,
    automationEvent: result.automationEvent ?? latestAutomationEvent ?? undefined,
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
  return latestAutomationEvent;
}
