"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import { Activity, Thermometer, Droplets, Wind, Lightbulb } from "lucide-react";

// Dynamically import the 3D Scene to disable Server-Side Rendering (SSR)
// This strictly prevents Next.js hydration errors and WebGL crashes.
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

// --- MOCK DATA DICTIONARY ---
const farmData: Record<
  string,
  {
    title: string;
    temp: string;
    humidity: string;
    moisture: string;
    led: string;
    vent: string;
    pump: string;
    pumpError: boolean;
  }
> = {
  overall: {
    title: "Overall Farm Status",
    temp: "24°C",
    humidity: "60%",
    moisture: "45%",
    led: "ON",
    vent: "ON",
    pump: "ERROR",
    pumpError: true,
  },
  rack: {
    title: "Main Frame & Plumbing",
    temp: "22°C",
    humidity: "65%",
    moisture: "N/A",
    led: "STANDBY",
    vent: "ON (Low)",
    pump: "ERROR (Check Valve)",
    pumpError: true,
  },
  plants: {
    title: "Plant Trays (Zone A)",
    temp: "26°C",
    humidity: "55%",
    moisture: "82%",
    led: "ON (High)",
    vent: "AUTO",
    pump: "OK",
    pumpError: false,
  },
  led: {
    title: "LED Light Array",
    temp: "28°C",
    humidity: "58%",
    moisture: "N/A",
    led: "ON (100%)",
    vent: "ON (Full)",
    pump: "OK",
    pumpError: false,
  },
};

export default function DigitalTwin() {
  const [selectedPart, setSelectedPart] = useState("overall");
  const currentData = farmData[selectedPart];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col p-4 md:p-6 lg:p-8">
      {/* --- HEADER --- */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Digital Twin</h1>
          <p className="text-gray-500 text-sm mt-1">
            Real-time 3D telemetry of vertical farm module
          </p>
        </div>
        <div className="flex items-center gap-4 bg-green-50 p-3 rounded-2xl border border-green-100">
          <svg
            className="w-8 h-8 text-green-600"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12,22C12,22 12,16 16,12C20,8 22,4 22,4C22,4 18,6 14,10C10,14 12,22 12,22Z" />
          </svg>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* --- 3D VIEWPORT --- */}
        <div className="lg:col-span-3 bg-slate-50 rounded-3xl shadow-inner border border-gray-200 overflow-hidden relative flex flex-col min-h-[50vh] lg:min-h-0">
          {/* Inject the dynamic 3D Scene */}
          <div className="absolute inset-0">
            <DynamicFarmScene onSelectPart={setSelectedPart} />
          </div>

          {/* Canvas UI Overlays */}
          <div className="absolute top-6 left-6 pointer-events-none">
            <div className="bg-white/90 backdrop-blur px-4 py-1.5 rounded-full text-xs font-bold text-green-700 shadow-sm border border-green-200 uppercase tracking-wide">
              {currentData.title}
            </div>
          </div>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between pointer-events-none">
            <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-3 pointer-events-auto border border-gray-100">
              <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse"></div>
              Live Telemetry
            </div>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 text-white px-5 py-2 rounded-xl text-sm font-medium shadow-lg hover:bg-black transition-transform hover:scale-105 active:scale-95 pointer-events-auto"
            >
              Reset View
            </button>
          </div>
        </div>

        {/* --- SIDE PANELS --- */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
          {/* Sensor Panel */}
          <div
            key={`sensor-${selectedPart}`}
            className="bg-green-600 text-white rounded-3xl p-6 shadow-xl shadow-green-200/50 animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both"
          >
            <h3 className="text-lg font-semibold mb-1">Sensor Data</h3>
            <p className="text-green-100 text-xs mb-5 uppercase tracking-wider">
              {currentData.title}
            </p>
            <div className="space-y-4">
              <DataRow
                icon={<Thermometer className="w-4 h-4" />}
                label="Temperature"
                value={currentData.temp}
              />
              <DataRow
                icon={<Droplets className="w-4 h-4" />}
                label="Humidity"
                value={currentData.humidity}
              />
              <DataRow
                icon={<Activity className="w-4 h-4" />}
                label="Soil Moisture"
                value={currentData.moisture}
              />
            </div>
          </div>

          {/* Device Status Panel */}
          <div
            key={`device-${selectedPart}`}
            className="bg-gray-900 text-white rounded-3xl p-6 shadow-xl flex-1 animate-in fade-in slide-in-from-right-4 duration-500 delay-75 fill-mode-both"
          >
            <h3 className="text-lg font-semibold mb-5">Device Status</h3>
            <div className="space-y-3">
              <StatusCard
                icon={<Lightbulb className="w-4 h-4" />}
                title="LED Array"
                subtitle="Photosynthesis"
                status={currentData.led}
              />
              <StatusCard
                icon={<Wind className="w-4 h-4" />}
                title="HVAC Fans"
                subtitle="Air Circulation"
                status={currentData.vent}
                isWarning={currentData.vent.includes("Low")}
              />
              <StatusCard
                icon={<Droplets className="w-4 h-4" />}
                title="Nutrient Pump"
                subtitle="Main Reservoir"
                status={currentData.pump}
                isError={currentData.pumpError}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---
interface DataRowProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function DataRow({ icon, label, value }: DataRowProps) {
  return (
    <div className="flex items-center justify-between pb-3 border-b border-green-500/30 last:border-0 last:pb-0">
      <div className="flex items-center gap-3 text-green-50 text-sm">
        <div className="bg-green-500/40 p-1.5 rounded-lg">{icon}</div>
        <span>{label}</span>
      </div>
      <span className="font-bold text-lg">{value}</span>
    </div>
  );
}

interface StatusCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  status: string;
  isError?: boolean;
  isWarning?: boolean;
}

function StatusCard({
  icon,
  title,
  subtitle,
  status,
  isError = false,
  isWarning = false,
}: StatusCardProps) {
  let stateStyles = "bg-green-500/20 text-green-300 border-green-500/20";
  let iconBg = "bg-white/10 text-gray-300";
  let textTitle = "text-gray-100";
  let borderStyle = "border-transparent bg-white/5";

  if (isError) {
    stateStyles = "bg-red-500/20 text-red-400 border-red-500/30";
    iconBg = "bg-red-500/20 text-red-400";
    textTitle = "text-red-300";
    borderStyle = "border-red-500/30 bg-red-500/5";
  } else if (isWarning) {
    stateStyles = "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    iconBg = "bg-yellow-500/20 text-yellow-400";
    textTitle = "text-yellow-300";
    borderStyle = "border-yellow-500/30 bg-yellow-500/5";
  }

  return (
    <div
      className={`rounded-2xl p-3.5 flex items-center justify-between border backdrop-blur-sm transition-colors ${borderStyle}`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>{icon}</div>
        <div>
          <div className={`text-sm font-semibold tracking-wide ${textTitle}`}>
            {title}
          </div>
          <div className="text-xs text-gray-400 mt-0.5">{subtitle}</div>
        </div>
      </div>
      <div
        className={`px-3 py-1 rounded-full text-xs font-bold tracking-wider border ${stateStyles}`}
      >
        {status}
      </div>
    </div>
  );
}
