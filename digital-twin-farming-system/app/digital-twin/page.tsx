"use client"

import { useEffect, useState } from 'react'
import { Activity, Thermometer, Droplets, Wind, Lightbulb, Box, AlertCircle } from 'lucide-react'
import type { DigitalTwinState } from '@/lib/types'

function statusBadge(status: string) {
  const styles =
    status === "on"
      ? "bg-green-500/20 text-green-300 border-green-500/20"
      : status === "off"
        ? "bg-gray-500/20 text-gray-400 border-gray-500/20"
        : status === "warning"
          ? "bg-amber-500/20 text-amber-300 border-amber-500/20"
          : "bg-red-500/20 text-red-300 border-red-500/20";

  return (
    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${styles}`}>
      {status.toUpperCase()}
    </div>
  );
}

export default function DigitalTwin() {
  const [dashboardState, setDashboardState] = useState<DigitalTwinState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/dashboard");
        const state = await response.json();
        setDashboardState(state);
      } catch (error) {
        console.error("Error loading digital twin state:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
    // Poll for updates every 5 seconds for a "live" feel
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const sensorReading = dashboardState?.sensorReading;
  const deviceState = dashboardState?.deviceState;
  const alerts = dashboardState?.alerts || [];

  if (isLoading && !dashboardState) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-xl font-semibold text-gray-500 animate-pulse">Initializing Digital Twin...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Digital Twin</h1>
          <p className="text-gray-500">Real-time 3D monitoring of vertical farm rack</p>
        </div>
        <div className="flex items-center gap-4">
           <svg className="w-10 h-10 text-primary opacity-80" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12,22C12,22 12,16 16,12C20,8 22,4 22,4C22,4 18,6 14,10C10,14 12,22 12,22Z" />
           </svg>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0">
        {/* Main 3D Viewport Placeholder */}
        <div className="lg:col-span-3 bg-card rounded-3xl shadow-sm border border-gray-100 overflow-hidden relative flex flex-col items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-br from-sidebar/5 to-primary/5 pointer-events-none" />
          
          <Box className="w-24 h-24 text-gray-300 mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold text-gray-600">3D Rack Model Placeholder</h2>
          <p className="text-gray-400 mt-2 max-w-md text-center px-6">
            The 3D model component will be integrated here by the team. It will reflect the device states shown in the panels.
          </p>

          <div className="absolute bottom-6 left-6 right-6 flex justify-between">
             <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${sensorReading ? 'bg-green-500' : 'bg-amber-500'}`}></div>
                {sensorReading ? 'Live Connection' : 'Mock Mode'}
             </div>
             
             {alerts.length > 0 && (
               <div className="bg-red-50/80 backdrop-blur-md px-4 py-2 rounded-xl text-sm font-medium shadow-sm flex items-center gap-2 text-red-600 border border-red-100">
                  <AlertCircle className="w-4 h-4" />
                  {alerts.length} Active Alerts
               </div>
             )}
          </div>
        </div>

        {/* Side Panels */}
        <div className="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 pb-2">
          
          <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-sm">
            <h3 className="text-lg font-medium opacity-90 mb-4">Sensor Data</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-90">
                  <Thermometer className="w-4 h-4" />
                  <span className="text-sm">Temperature</span>
                </div>
                <span className="font-bold">{sensorReading?.temperature ?? '--'}°C</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-90">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">Humidity</span>
                </div>
                <span className="font-bold">{sensorReading?.humidity ?? '--'}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-90">
                  <Activity className="w-4 h-4" />
                  <span className="text-sm">Soil Moisture</span>
                </div>
                <span className="font-bold">{sensorReading?.soilMoisture ?? '--'}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 opacity-90">
                  <Droplets className="w-4 h-4" />
                  <span className="text-sm">Water Level</span>
                </div>
                <span className="font-bold">{sensorReading?.waterLevel ?? '--'}%</span>
              </div>
            </div>
          </div>

          <div className="bg-sidebar text-sidebar-foreground rounded-3xl p-6 shadow-sm flex-1">
            <h3 className="text-lg font-medium opacity-90 mb-4">Device Status</h3>
            <div className="space-y-4">
              
              <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">LED Lights</div>
                    <div className="text-xs opacity-70">Top Rack</div>
                  </div>
                </div>
                {deviceState && statusBadge(deviceState.ledStatus)}
              </div>

              <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Wind className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Ventilation</div>
                    <div className="text-xs opacity-70">Cooling Fan</div>
                  </div>
                </div>
                {deviceState && statusBadge(deviceState.fanStatus)}
              </div>

              <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Water Pump</div>
                    <div className="text-xs opacity-70">Main Reservoir</div>
                  </div>
                </div>
                {deviceState && statusBadge(deviceState.pumpStatus)}
              </div>

              <div className="bg-white/10 rounded-2xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <Droplets className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Reservoir</div>
                    <div className="text-xs opacity-70">Water Level</div>
                  </div>
                </div>
                {deviceState && statusBadge(deviceState.reservoirStatus)}
              </div>

            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
