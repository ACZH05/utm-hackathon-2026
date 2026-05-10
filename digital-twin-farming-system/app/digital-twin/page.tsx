"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import {
  Activity,
  Thermometer,
  Droplets,
  Wind,
  Lightbulb,
  AlertTriangle,
  Leaf,
} from "lucide-react";
import {
  DigitalTwinState,
  DeviceStatus,
  SelectedComponent,
  PlantProfile,
  Recommendation,
  DeviceState,
  AutomationSettings,
} from "@/lib/types";

const DynamicFarmScene = dynamic(
  () => import("@/components/models/FarmScene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-green-500"></div>
      </div>
    ),
  },
);

const defaultRec: Recommendation = {
  trayId: "overall",
  title: "System OK",
  message: "All parameters nominal.",
  suggestedAction: "Continue standard operation",
  severity: "info",
  confidence: 0.95,
};

const mockPlantProfile: PlantProfile = {
  id: "lettuce-001",
  cropName: "Butterhead Lettuce",
  safeTemperatureRange: [18, 24],
  safeHumidityRange: [50, 70],
  safeSoilMoistureRange: [60, 80],
  safeWaterPhRange: [5.5, 6.5],
  safeWaterLevelRange: [70, 100],
};

const defaultDeviceState: DeviceState = {
  trayId: "overall",
  ledStatus: "on",
  fanStatus: "on",
  pumpStatus: "critical",
  reservoirStatus: "normal",
};

const defaultAutomationSettings: AutomationSettings = {
  trayId: "overall",
  mode: "manual",
  ledStartTime: "07:00",
  ledEndTime: "19:00",
  ledSpectrum: "mixed",
  fanTriggerTemperature: 24,
  pumpIntervalMinutes: 30,
  pumpDurationSeconds: 90,
};

const createMockState = (
  overrides?: Partial<DigitalTwinState>,
): DigitalTwinState => ({
  sensorReading: {
    trayId: "overall",
    temperature: 24,
    humidity: 60,
    soilMoisture: 75,
    waterPh: 6.0,
    waterLevel: 85,
    createdAt: new Date().toISOString(),
  },
  deviceState: { ...defaultDeviceState },
  alerts: [],
  recommendation: defaultRec,
  automationSettings: { ...defaultAutomationSettings },
  ...overrides,
});

const initialFarmData: Record<string, DigitalTwinState> = {
  overall: createMockState({
    alerts: [
      {
        trayId: "overall",
        type: "HARDWARE",
        severity: "critical",
        message: "Pump pressure drop detected",
        createdAt: new Date().toISOString(),
      },
    ],
    recommendation: {
      trayId: "overall",
      title: "Maintenance Required",
      message: "Main pump is showing critical flow resistance.",
      suggestedAction: "Inspect check valve",
      severity: "critical",
      confidence: 0.92,
    },
  }),
  rack: createMockState(),
  pump: createMockState(),
  fan: createMockState(),
  reservoir: createMockState(),
  plants_A: createMockState(),
  led_A: createMockState(),
  plants_B: createMockState({
    deviceState: { ...defaultDeviceState, ledStatus: "warning" },
  }),
  led_B: createMockState({
    deviceState: { ...defaultDeviceState, ledStatus: "warning" },
  }),
  plants_C: createMockState({
    deviceState: { ...defaultDeviceState, ledStatus: "off" },
  }),
  led_C: createMockState({
    deviceState: { ...defaultDeviceState, ledStatus: "off" },
  }),
};

export default function DigitalTwin() {
  const [selected, setSelected] = useState<SelectedComponent | null>(null);
  const [zonesData, setZonesData] =
    useState<Record<string, DigitalTwinState>>(initialFarmData);

  const activeKey = selected ? selected.name : "overall";
  const currentData = zonesData[activeKey] || zonesData["overall"];

  const toggleGlobalDevice = (device: keyof DeviceState) => {
    setZonesData((prev) => {
      const newState = { ...prev };
      const currentStatus = newState["overall"].deviceState[device];
      const nextStatus: DeviceStatus = currentStatus === "on" ? "off" : "on";

      Object.keys(newState).forEach((key) => {
        newState[key] = {
          ...newState[key],
          deviceState: { ...newState[key].deviceState, [device]: nextStatus },
        };
      });
      return newState;
    });
  };

  const toggleLed = () => {
    setZonesData((prev) => {
      const newState = { ...prev };
      const currentLed = newState[activeKey]?.deviceState.ledStatus || "off";
      const nextLed: DeviceStatus =
        currentLed === "on" ? "off" : currentLed === "off" ? "warning" : "on";

      if (
        !selected ||
        ["rack", "pump", "fan", "reservoir"].includes(selected.type)
      ) {
        Object.keys(newState).forEach((key) => {
          newState[key] = {
            ...newState[key],
            deviceState: { ...newState[key].deviceState, ledStatus: nextLed },
          };
        });
      } else {
        const zone = activeKey.split("_")[1];
        if (zone) {
          if (newState[`led_${zone}`]) {
            newState[`led_${zone}`] = {
              ...newState[`led_${zone}`],
              deviceState: {
                ...newState[`led_${zone}`].deviceState,
                ledStatus: nextLed,
              },
            };
          }
          if (newState[`plants_${zone}`]) {
            newState[`plants_${zone}`] = {
              ...newState[`plants_${zone}`],
              deviceState: {
                ...newState[`plants_${zone}`].deviceState,
                ledStatus: nextLed,
              },
            };
          }
        }
      }
      return newState;
    });
  };

  const showAllControls = !selected || selected.name === "rack";
  const showLed =
    showAllControls || selected?.type === "led" || selected?.type === "plant";
  const showFan = showAllControls || selected?.type === "fan";
  const showPump =
    showAllControls ||
    selected?.type === "pump" ||
    selected?.type === "reservoir";

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="min-w-0 pr-4">
          <h1 className="text-3xl font-bold text-gray-900 truncate">
            Digital Twin
          </h1>
          <p className="text-gray-500 text-sm mt-1 truncate">
            Strict Typed Telemetry
          </p>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* 3D VIEWPORT */}
        <div className="lg:col-span-3 bg-slate-50 rounded-3xl shadow-inner border border-gray-200 overflow-hidden relative flex flex-col min-h-[50vh] lg:min-h-0">
          <DynamicFarmScene onSelectPart={setSelected} zonesData={zonesData} />

          <div className="absolute top-6 left-6 pointer-events-none max-w-[80%]">
            <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-green-700 shadow-sm border border-green-200 uppercase tracking-wide truncate">
              {selected
                ? `${selected.type.toUpperCase()}: ${selected.name.replace("_", " ")}`
                : "OVERALL FARM"}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3 pointer-events-auto border border-gray-100 shrink-0">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shrink-0"></div>
              <span className="hidden sm:inline">Live Telemetry</span>
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-black transition-transform hover:scale-105 active:scale-95 pointer-events-auto shrink-0"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* SIDE PANELS */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
          {/* SENSOR PANEL */}
          <div className="bg-slate-800 text-white rounded-3xl p-6 shadow-xl shrink-0 border border-slate-700">
            <h3 className="text-lg font-semibold mb-5 text-slate-100 flex items-center justify-between">
              Sensor Data
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded">Live</span>
            </h3>
            <div className="space-y-4">
              <DataRow
                icon={<Thermometer className="w-4 h-4 shrink-0 text-orange-400" />}
                label="Temperature"
                value={`${currentData.sensorReading.temperature}°C`}
              />
              <DataRow
                icon={<Droplets className="w-4 h-4 shrink-0 text-blue-400" />}
                label="Humidity"
                value={`${currentData.sensorReading.humidity}%`}
              />
              <DataRow
                icon={<Activity className="w-4 h-4 shrink-0 text-emerald-400" />}
                label="Soil Moisture"
                value={`${currentData.sensorReading.soilMoisture}%`}
              />
            </div>
          </div>

          {/* PLANT PROFILE PANEL */}
          {selected?.type === "plant" && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-xl shrink-0">
              <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold">
                <Leaf className="w-5 h-5" />
                <h3>{mockPlantProfile.cropName}</h3>
              </div>
              <div className="space-y-2 text-xs font-medium text-emerald-900/70">
                <div className="flex justify-between">
                  <span>Safe Temp:</span>{" "}
                  <span>
                    {mockPlantProfile.safeTemperatureRange.join(" - ")}°C
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Safe Humidity:</span>{" "}
                  <span>{mockPlantProfile.safeHumidityRange.join(" - ")}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Target pH:</span>{" "}
                  <span>{mockPlantProfile.safeWaterPhRange.join(" - ")}</span>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC DEVICE STATUS PANEL */}
          <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex-1 shrink-0">
            <h3 className="text-lg font-semibold mb-5 flex items-center justify-between">
              {showAllControls ? "Global Controls" : "Device Control"}
            </h3>
            <div className="space-y-3">
              {showLed && (
                <StatusCard
                  icon={<Lightbulb className="w-4 h-4" />}
                  title="LED Array"
                  subtitle="Spectrum"
                  status={currentData.deviceState.ledStatus}
                  onClick={toggleLed}
                />
              )}
              {showFan && (
                <StatusCard
                  icon={<Wind className="w-4 h-4" />}
                  title="HVAC Fans"
                  subtitle="Circulation"
                  status={currentData.deviceState.fanStatus}
                  onClick={() => toggleGlobalDevice("fanStatus")}
                />
              )}
              {showPump && (
                <StatusCard
                  icon={<Droplets className="w-4 h-4" />}
                  title="Nutrient Pump"
                  subtitle="Reservoir"
                  status={currentData.deviceState.pumpStatus}
                  onClick={() => toggleGlobalDevice("pumpStatus")}
                />
              )}
            </div>
          </div>

          {/* ALERTS & RECOMMENDATIONS */}
          {currentData.recommendation &&
            currentData.recommendation.severity !== "info" && (
              <div className="bg-red-50 border border-red-200 rounded-3xl p-6 shadow-xl shrink-0">
                <div className="flex items-center gap-2 mb-2 text-red-600 font-bold">
                  <AlertTriangle className="w-5 h-5" />
                  <h3>{currentData.recommendation.title}</h3>
                </div>
                <p className="text-sm text-red-800 mb-3">
                  {currentData.recommendation.message}
                </p>
                <div className="bg-white rounded-xl p-3 border border-red-100 text-sm font-medium text-gray-700">
                  <span className="text-red-500 font-bold block text-xs uppercase mb-1">
                    Suggested Action
                  </span>
                  {currentData.recommendation.suggestedAction}
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

function DataRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-700/50 last:border-0 gap-3">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <div className="bg-slate-700/50 p-1.5 rounded-lg shrink-0 border border-slate-600/50">
          {icon}
        </div>
        <span className="text-xs font-medium text-slate-400 leading-tight">
          {label}
        </span>
      </div>
      <span className="font-bold text-base text-white tabular-nums shrink-0 ml-1">
        {value}
      </span>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  subtitle,
  status,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: DeviceStatus;
  onClick: () => void;
}) {
  const styleMap = {
    normal: {
      bg: "bg-green-500/10 border-green-500/20",
      text: "text-green-400",
      icon: "bg-green-500/20 text-green-400 border-green-500/30",
      statusBg: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    on: {
      bg: "bg-green-500/10 border-green-500/20",
      text: "text-green-400",
      icon: "bg-green-500/20 text-green-400 border-green-500/30",
      statusBg: "bg-green-500/20 text-green-400 border-green-500/30",
    },
    warning: {
      bg: "bg-yellow-500/10 border-yellow-500/20",
      text: "text-yellow-400",
      icon: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      statusBg: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    },
    critical: {
      bg: "bg-red-500/10 border-red-500/20",
      text: "text-red-400",
      icon: "bg-red-500/20 text-red-400 border-red-500/30",
      statusBg: "bg-red-500/20 text-red-400 border-red-500/30",
    },
    off: {
      bg: "bg-slate-800/50 border-slate-700",
      text: "text-slate-400",
      icon: "bg-slate-700/50 text-slate-500 border-slate-600/50",
      statusBg: "bg-slate-700/50 text-slate-400 border-slate-600/50",
    },
  };
  const currentStyle = styleMap[status] || styleMap.off;

  return (
    <div className="relative group overflow-hidden rounded-2xl transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]">
      <button
        onClick={onClick}
        className="absolute inset-0 z-20 w-full h-full cursor-pointer focus:outline-none"
        aria-label={`Toggle ${title}`}
      />
      
      <div className={`relative z-10 p-3 flex items-center justify-between gap-3 border ${currentStyle.bg} transition-colors duration-300`}>
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`p-1.5 rounded-lg shrink-0 border ${currentStyle.icon}`}>
            {/* Small icon size wrapper */}
            <div className="scale-90">
              {icon}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white leading-tight">
              {title}
            </div>
            <div className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 leading-none ${currentStyle.text}`}>
              {subtitle}
            </div>
          </div>
        </div>
        
        <div className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border shrink-0 ${currentStyle.statusBg}`}>
          {status}
        </div>
      </div>
      
      <div className="absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-tr from-white/5 via-transparent to-white/5" />
    </div>
  );
}
