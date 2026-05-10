"use client"

import { useEffect, useState, useRef } from 'react'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts'
import { AlertTriangle, CheckCircle2, ChevronDown, Droplet, Layers, LayoutGrid, Leaf, Sparkles, TrendingUp, Zap, Check } from 'lucide-react'
import type { DigitalTwinState, SensorReading, Rack, Tray } from '@/lib/types'

// Mock Data for fields not in DB yet
const weeklyConsumption = [
  { name: 'Mon', water: 4000, power: 2400 },
  { name: 'Tue', water: 3000, power: 1398 },
  { name: 'Wed', water: 2000, power: 9800 },
  { name: 'Thu', water: 2780, power: 3908 },
  { name: 'Fri', water: 1890, power: 4800 },
  { name: 'Sat', water: 2390, power: 3800 },
  { name: 'Sun', water: 3490, power: 4300 },
]

const cropDistribution = [
  { name: 'Lettuce', value: 400 },
  { name: 'Basil', value: 300 },
  { name: 'Kale', value: 300 },
  { name: 'Microgreens', value: 200 },
]

const COLORS = ['#3D5654', '#C49646', '#4CAF50', '#81C784']

export default function Dashboard() {
  const [racks, setRacks] = useState<Rack[]>([]);
  const [trays, setTrays] = useState<Tray[]>([]);
  const [selectedRackId, setSelectedRackId] = useState<string>("");
  const [selectedTrayId, setSelectedTrayId] = useState<string>("");

  const [dashboardState, setDashboardState] = useState<DigitalTwinState | null>(null);
  const [history, setHistory] = useState<SensorReading[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isRackOpen, setIsRackOpen] = useState(false);
  const [isTrayOpen, setIsTrayOpen] = useState(false);
  const rackDropdownRef = useRef<HTMLDivElement>(null);
  const trayDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (rackDropdownRef.current && !rackDropdownRef.current.contains(event.target as Node)) {
        setIsRackOpen(false);
      }
      if (trayDropdownRef.current && !trayDropdownRef.current.contains(event.target as Node)) {
        setIsTrayOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Initial load of racks
  useEffect(() => {
    async function loadRacks() {
      const response = await fetch("/api/racks");
      const data = (await response.json()) as Rack[];
      setRacks(data);
      if (data.length > 0) {
        setSelectedRackId(data[0].id);
      }
    }
    loadRacks().catch(console.error);
  }, []);

  // Load trays when rack changes
  useEffect(() => {
    if (!selectedRackId) return;

    async function loadTrays() {
      const response = await fetch(`/api/trays?rackId=${selectedRackId}`);
      const data = (await response.json()) as Tray[];
      setTrays(data);
      if (data.length > 0) {
        setSelectedTrayId(data[0].id);
      } else {
        setSelectedTrayId("");
      }
    }
    loadTrays().catch(console.error);
  }, [selectedRackId]);

  useEffect(() => {
    async function fetchData() {
      if (!selectedTrayId) return;
      
      setIsLoading(true);
      try {
        const [dbResponse, historyResponse] = await Promise.all([
          fetch(`/api/dashboard?trayId=${selectedTrayId}`),
          fetch(`/api/sensors/history?trayId=${selectedTrayId}`)
        ]);
        
        const dbData = await dbResponse.json();
        const historyData = await historyResponse.json();
        
        setDashboardState(dbData);
        setHistory(historyData.readings || []);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [selectedTrayId]);

  const alerts = dashboardState?.alerts || [];
  const recommendation = dashboardState?.recommendation;

  // Format history for the chart
  const chartData = history.map(h => ({
    time: new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    temp: h.temperature,
    humidity: h.humidity
  }));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Farming Dashboard</h1>
          <p className="text-gray-500">Overview of your vertical farm operations</p>
        </div>
        <div className="flex items-center gap-4">
           {isLoading && !dashboardState ? (
             <div className="w-12 h-12 rounded-full skeleton" />
           ) : (
             <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
             </svg>
           )}
        </div>
      </div>

      {/* Rack and Tray Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <label className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <LayoutGrid className="h-4 w-4 text-primary" />
            Select Rack
          </div>
          {racks.length === 0 ? (
            <div className="w-full h-[46px] rounded-2xl skeleton" />
          ) : (
            <div className="relative" ref={rackDropdownRef}>
              <button
                type="button"
                onClick={() => setIsRackOpen(!isRackOpen)}
                className={`w-full flex items-center justify-between rounded-2xl border bg-white pl-4 pr-4 py-3 text-sm outline-none shadow-sm transition-all duration-300 ${
                  isRackOpen ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <span className="truncate">
                  {racks.find((r) => r.id === selectedRackId)?.name || "Select Rack"}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isRackOpen ? "rotate-180" : ""}`} />
              </button>

              {isRackOpen && (
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {racks.map((rack) => {
                      const isSelected = rack.id === selectedRackId;
                      return (
                        <div
                          key={rack.id}
                          onClick={() => {
                            setSelectedRackId(rack.id);
                            setIsRackOpen(false);
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                            isSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700 hover:bg-primary/5 hover:pl-5"
                          }`}
                        >
                          <span className="truncate">{rack.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </label>

        <label className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <Layers className="h-4 w-4 text-primary" />
            Select Tray
          </div>
          {selectedRackId && trays.length === 0 && isLoading ? (
            <div className="w-full h-[46px] rounded-2xl skeleton" />
          ) : (
            <div className="relative" ref={trayDropdownRef}>
              <button
                type="button"
                onClick={() => !trays.length ? null : setIsTrayOpen(!isTrayOpen)}
                disabled={trays.length === 0}
                className={`w-full flex items-center justify-between rounded-2xl border bg-white pl-4 pr-4 py-3 text-sm outline-none shadow-sm transition-all duration-300 disabled:bg-gray-50 disabled:opacity-70 disabled:cursor-not-allowed ${
                  isTrayOpen ? "border-primary ring-2 ring-primary/20" : "border-gray-200 hover:border-primary/60 hover:shadow-md hover:-translate-y-0.5"
                }`}
              >
                <span className="truncate">
                  {trays.find((t) => t.id === selectedTrayId)?.name || "Select Tray"}
                </span>
                <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${isTrayOpen ? "rotate-180" : ""}`} />
              </button>

              {isTrayOpen && trays.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-2 shadow-lg">
                  <div className="max-h-60 overflow-y-auto space-y-1">
                    {trays.map((tray) => {
                      const isSelected = tray.id === selectedTrayId;
                      return (
                        <div
                          key={tray.id}
                          onClick={() => {
                            setSelectedTrayId(tray.id);
                            setIsTrayOpen(false);
                          }}
                          className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-sm transition-all duration-300 ${
                            isSelected
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-gray-700 hover:bg-primary/5 hover:pl-5"
                          }`}
                        >
                          <span className="truncate">{tray.name}</span>
                          {isSelected && <Check className="h-4 w-4 text-primary" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </label>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="group bg-primary text-primary-foreground rounded-3xl p-6 shadow-sm relative overflow-hidden border-2 border-transparent hover:border-primary-foreground/40 hover:shadow-lg transition-all duration-500 cursor-pointer hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Overall Growth Index</h3>
            <div className="text-4xl font-bold mb-4">98%</div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>+2.4% from last week</span>
            </div>
          </div>
          <Leaf className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 group-hover:opacity-40 group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ease-out" />
        </div>

        <div className="group bg-sidebar text-sidebar-foreground rounded-3xl p-6 shadow-sm relative overflow-hidden border-2 border-transparent hover:border-blue-400/50 hover:shadow-lg transition-all duration-500 cursor-pointer hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Daily Water Usage</h3>
            <div className="text-4xl font-bold mb-4">1,240<span className="text-xl">L</span></div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Droplet className="w-4 h-4" />
              <span>Optimal consumption</span>
            </div>
          </div>
          <Droplet className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:text-blue-500 transition-all duration-700 ease-out" />
        </div>

        <div className="group bg-sidebar text-sidebar-foreground rounded-3xl p-6 shadow-sm relative overflow-hidden border-2 border-transparent hover:border-yellow-400/50 hover:shadow-lg transition-all duration-500 cursor-pointer hover:-translate-y-1">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Daily Power Usage</h3>
            <div className="text-4xl font-bold mb-4">340<span className="text-xl">kWh</span></div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Zap className="w-4 h-4" />
              <span>System efficiency: 94%</span>
            </div>
          </div>
          <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 group-hover:opacity-20 group-hover:scale-110 group-hover:text-yellow-500 transition-all duration-700 ease-out" />
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts & Recommendations</h3>
          <div className="space-y-4">
            {isLoading && !dashboardState ? (
              <div className="space-y-4">
                <div className="h-24 rounded-2xl skeleton" />
                <div className="h-28 rounded-2xl skeleton" />
              </div>
            ) : (
              <>
                {alerts.length > 0 ? (
                  alerts.map((alert, index) => (
                    <div key={index} className={`flex items-start gap-4 p-4 border rounded-2xl ${
                      alert.severity === 'critical' ? 'border-red-100 bg-red-50' : 'border-amber-100 bg-amber-50'
                    }`}>
                      <div className="relative">
                        <div className={`absolute inset-0 rounded-full animate-ping blur-sm opacity-60 ${
                          alert.severity === 'critical' ? 'bg-red-400' : 'bg-amber-400'
                        }`} />
                        <div className={`relative p-2 rounded-full z-10 animate-pulse ${
                          alert.severity === 'critical' ? 'bg-red-100 text-red-600 shadow-[0_0_25px_rgba(239,68,68,0.6)]' : 'bg-amber-100 text-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.6)]'
                        }`}>
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                      </div>
                      <div>
                        <h4 className={`font-semibold ${alert.severity === 'critical' ? 'text-red-800' : 'text-amber-800'}`}>{alert.type.toUpperCase()} Alert</h4>
                        <p className={`text-sm ${alert.severity === 'critical' ? 'text-red-600' : 'text-amber-600'} mb-2`}>{alert.message}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 p-4 border border-green-100 bg-green-50 rounded-2xl">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-green-800">System Stable</h4>
                      <p className="text-sm text-green-600">All sensors report values within safe operating ranges.</p>
                    </div>
                  </div>
                )}
                
                {recommendation && (
                  <div className="flex items-start gap-4 p-4 border border-primary/20 bg-primary/5 rounded-2xl">
                    <div className="bg-primary/10 p-2 rounded-full text-primary">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800">{recommendation.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{recommendation.message}</p>
                      <div className="inline-flex items-center gap-1 text-xs font-medium bg-white px-3 py-1 rounded-full border border-primary/20 text-primary">
                        <Zap className="w-3 h-3" /> Suggested: {recommendation.suggestedAction}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Resource Consumption</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyConsumption} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Bar dataKey="water" fill="#C49646" radius={[4, 4, 0, 0]} barSize={12} />
                <Bar dataKey="power" fill="#3D5654" radius={[4, 4, 0, 0]} barSize={12} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Crop Distribution</h3>
          <div className="h-52 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {cropDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs text-gray-500">Total</span>
              <span className="text-xl font-bold text-gray-800">1.2k</span>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {cropDistribution.map((crop, index) => {
              const percentage = Math.round((crop.value / 1200) * 100);
              return (
                <div key={crop.name} className="flex items-center gap-2 p-1 rounded-lg hover:bg-gray-50 transition-colors">
                  <div 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} 
                  />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-gray-700 leading-tight">{crop.name}</span>
                    <span className="text-[10px] text-gray-500 leading-tight">{percentage}% ({crop.value})</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Historical Sensor Trends</h3>
          <div className="h-64">
            {isLoading && history.length === 0 ? (
              <div className="w-full h-full rounded-2xl skeleton" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C49646" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C49646" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorHum" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3D5654" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3D5654" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                  <Area type="monotone" dataKey="temp" stroke="#C49646" strokeWidth={3} fillOpacity={1} fill="url(#colorTemp)" />
                  <Area type="monotone" dataKey="humidity" stroke="#3D5654" strokeWidth={3} fillOpacity={1} fill="url(#colorHum)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
