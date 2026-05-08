"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Thermometer, Droplets, Wind, Lightbulb } from "lucide-react";

const DynamicFarmScene = dynamic(
  () => import("@/components/models/FarmScene"),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col items-center justify-center h-full space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-t-2 border-green-500"></div>
        <p className="text-gray-500 font-medium animate-pulse">
          Initializing WebGL Engine...
        </p>
      </div>
    ),
  },
);

// --- INITIAL DATA DICTIONARY ---
const initialFarmData: Record<
  string,
  {
    title: string;
    temp: string;
    humidity: string;
    moisture: string;
    led: string;
  }
> = {
  overall: {
    title: "Overall Farm Status",
    temp: "24°C",
    humidity: "60%",
    moisture: "45%",
    led: "ON (Full Spectrum)",
  },
  rack: {
    title: "Main Frame",
    temp: "22°C",
    humidity: "65%",
    moisture: "N/A",
    led: "STANDBY",
  },
  pump: {
    title: "Main Water Pump",
    temp: "23°C",
    humidity: "62%",
    moisture: "100%",
    led: "STANDBY",
  },
  fan: {
    title: "HVAC Circulation Fan",
    temp: "21°C",
    humidity: "58%",
    moisture: "N/A",
    led: "STANDBY",
  },
  reservoir: {
    title: "Nutrient Reservoir",
    temp: "20°C",
    humidity: "65%",
    moisture: "100%",
    led: "STANDBY",
  },
  plants_A: {
    title: "Plant Trays (Zone A)",
    temp: "26°C",
    humidity: "55%",
    moisture: "82%",
    led: "ON (High)",
  },
  led_A: {
    title: "LED Array (Zone A)",
    temp: "28°C",
    humidity: "50%",
    moisture: "N/A",
    led: "ON (High)",
  },
  plants_B: {
    title: "Plant Trays (Zone B)",
    temp: "25°C",
    humidity: "56%",
    moisture: "78%",
    led: "ON (Med)",
  },
  led_B: {
    title: "LED Array (Zone B)",
    temp: "27°C",
    humidity: "52%",
    moisture: "N/A",
    led: "ON (Med)",
  },
  plants_C: {
    title: "Plant Trays (Zone C)",
    temp: "24°C",
    humidity: "58%",
    moisture: "85%",
    led: "ON (Low)",
  },
  led_C: {
    title: "LED Array (Zone C)",
    temp: "27°C",
    humidity: "51%",
    moisture: "N/A",
    led: "ON (Low)",
  },
};

export default function DigitalTwin() {
  const [selectedPart, setSelectedPart] = useState("overall");
  const [zonesData, setZonesData] = useState(initialFarmData);
  const [globalFan, setGlobalFan] = useState("AUTO");
  const [globalPump, setGlobalPump] = useState("OK");

  const currentData = zonesData[selectedPart] || zonesData["overall"];

  const toggleFan = () =>
    setGlobalFan((prev) =>
      prev === "AUTO" ? "ON (High)" : prev === "ON (High)" ? "OFF" : "AUTO",
    );
  const togglePump = () =>
    setGlobalPump((prev) =>
      prev === "OK" ? "OFF" : prev === "OFF" ? "ERROR" : "OK",
    );

  // --- SMARTER LED TOGGLE LOGIC ---
  const toggleLed = () => {
    setZonesData((prev) => {
      const currentLed = prev[selectedPart]?.led || "OFF";
      let nextLed = "OFF";
      if (currentLed.includes("ON")) nextLed = "STANDBY";
      else if (currentLed === "STANDBY") nextLed = "OFF";
      else nextLed = "ON (Full Spectrum)";

      // If viewing Overall/Rack, change ALL zones at once
      if (selectedPart === "overall" || selectedPart === "rack") {
        return {
          ...prev,
          overall: { ...prev.overall, led: nextLed },
          led_A: { ...prev.led_A, led: nextLed },
          plants_A: { ...prev.plants_A, led: nextLed },
          led_B: { ...prev.led_B, led: nextLed },
          plants_B: { ...prev.plants_B, led: nextLed },
          led_C: { ...prev.led_C, led: nextLed },
          plants_C: { ...prev.plants_C, led: nextLed },
        };
      }

      // If viewing a specific Zone, ONLY change that zone (syncing both plant and led panels)
      const zone = selectedPart.split("_")[1]; // Extracts "A", "B", or "C"
      if (zone) {
        return {
          ...prev,
          [`led_${zone}`]: { ...prev[`led_${zone}`], led: nextLed },
          [`plants_${zone}`]: { ...prev[`plants_${zone}`], led: nextLed },
        };
      }

      return {
        ...prev,
        [selectedPart]: { ...prev[selectedPart], led: nextLed },
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6 lg:p-8">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div className="min-w-0 pr-4">
          <h1 className="text-3xl font-bold text-gray-900 truncate">
            Digital Twin
          </h1>
          <p className="text-gray-500 text-sm mt-1 truncate">
            Real-time 3D telemetry of vertical farm
          </p>
        </div>
        <div className="flex items-center gap-4 bg-green-50 p-3 rounded-2xl border border-green-100 shrink-0">
          <Activity className="w-8 h-8 text-green-600" />
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* 3D VIEWPORT */}
        <div className="lg:col-span-3 bg-slate-50 rounded-3xl shadow-inner border border-gray-200 overflow-hidden relative flex flex-col min-h-[50vh] lg:min-h-0">
          {/* 👇 PASS THE FULL zonesData SO EACH TIER CAN CHECK ITS OWN LIGHT 👇 */}
          <DynamicFarmScene
            onSelectPart={setSelectedPart}
            zonesData={zonesData}
            fanStatus={globalFan}
            pumpStatus={globalPump}
          />

          <div className="absolute top-6 left-6 pointer-events-none max-w-[80%]">
            <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-green-700 shadow-sm border border-green-200 uppercase tracking-wide truncate">
              {currentData.title}
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
          {/* Sensor Panel */}
          <div
            key={`sensor-${selectedPart}`}
            className="bg-green-600 text-white rounded-3xl p-6 shadow-xl shadow-green-200/50 animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both shrink-0"
          >
            <h3 className="text-lg font-semibold mb-1">Sensor Data</h3>
            <p className="text-green-100 text-xs mb-5 uppercase tracking-wider truncate">
              {currentData.title}
            </p>
            <div className="space-y-4">
              <DataRow
                icon={<Thermometer className="w-4 h-4 shrink-0" />}
                label="Temperature"
                value={currentData.temp}
              />
              <DataRow
                icon={<Droplets className="w-4 h-4 shrink-0" />}
                label="Humidity"
                value={currentData.humidity}
              />
              <DataRow
                icon={<Activity className="w-4 h-4 shrink-0" />}
                label="Soil Moisture"
                value={currentData.moisture}
              />
            </div>
          </div>

          {/* Device Status Panel */}
          <div className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex-1 shrink-0">
            <h3 className="text-lg font-semibold mb-5">Device Controls</h3>
            <div className="space-y-3">
              <StatusCard
                icon={<Lightbulb className="w-4 h-4" />}
                title="LED Array"
                subtitle={
                  selectedPart.includes("_")
                    ? `Zone ${selectedPart.split("_")[1]}`
                    : "Photosynthesis"
                }
                status={currentData.led}
                onClick={toggleLed}
              />
              <StatusCard
                icon={<Wind className="w-4 h-4" />}
                title="HVAC Fans"
                subtitle="Global Circulation"
                status={globalFan}
                isWarning={globalFan === "OFF"}
                onClick={toggleFan}
              />
              <StatusCard
                icon={<Droplets className="w-4 h-4" />}
                title="Nutrient Pump"
                subtitle="Main Reservoir"
                status={globalPump}
                isError={globalPump === "ERROR"}
                onClick={togglePump}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
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
    <div className="flex items-center justify-between pb-3 border-b border-green-500/30 last:border-0 last:pb-0 gap-3">
      <div className="flex items-center gap-3 text-green-50 text-sm flex-1 min-w-0">
        <div className="bg-green-500/40 p-1.5 rounded-lg shrink-0">{icon}</div>
        <span className="leading-tight wrap-break-word whitespace-normal">
          {label}
        </span>
      </div>
      <span className="font-bold text-lg shrink-0 text-right">{value}</span>
    </div>
  );
}

function StatusCard({
  icon,
  title,
  subtitle,
  status,
  isError = false,
  isWarning = false,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: string;
  isError?: boolean;
  isWarning?: boolean;
  onClick: () => void;
}) {
  let stateStyles = "bg-green-500/20 text-green-300 border-green-500/20";
  let iconBg = "bg-white/10 text-gray-300";
  let textTitle = "text-gray-100";
  let borderStyle = "border-transparent bg-white/5";
  if (isError) {
    stateStyles =
      "bg-red-500/20 text-red-400 border-red-500/30 hover:bg-red-500/30";
    iconBg = "bg-red-500/20 text-red-400";
    textTitle = "text-red-300";
    borderStyle = "border-red-500/30 bg-red-500/5";
  } else if (isWarning || status === "OFF" || status === "STANDBY") {
    stateStyles =
      "bg-yellow-500/20 text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/30";
    iconBg = "bg-yellow-500/20 text-yellow-400";
    textTitle = "text-yellow-300";
    borderStyle = "border-yellow-500/30 bg-yellow-500/5";
  } else {
    stateStyles += " hover:bg-green-500/30";
  }

  return (
    <div
      className={`rounded-2xl p-3.5 flex items-center justify-between border backdrop-blur-sm transition-colors ${borderStyle} gap-3`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className={`p-2.5 rounded-xl shrink-0 ${iconBg}`}>{icon}</div>
        <div className="flex-1 pr-2">
          <div
            className={`text-sm font-semibold tracking-wide leading-tight wrap-break-word whitespace-normal ${textTitle}`}
          >
            {title}
          </div>
          <div className="text-xs text-gray-400 mt-0.5 leading-tight wrap-break-word whitespace-normal">
            {subtitle}
          </div>
        </div>
      </div>
      <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-full text-[10px] sm:text-xs font-bold tracking-wider border shrink-0 text-center wrap-break-word whitespace-normal max-w-36 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${stateStyles}`}
      >
        {status}
      </button>
    </div>
  );
}
