"use client"

import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
  PieChart, Pie, Cell
} from 'recharts'
import { Leaf, Droplet, Zap, AlertTriangle, CheckCircle2, TrendingUp } from 'lucide-react'

// Mock Data
const weeklyConsumption = [
  { name: 'Mon', water: 4000, power: 2400 },
  { name: 'Tue', water: 3000, power: 1398 },
  { name: 'Wed', water: 2000, power: 9800 },
  { name: 'Thu', water: 2780, power: 3908 },
  { name: 'Fri', water: 1890, power: 4800 },
  { name: 'Sat', water: 2390, power: 3800 },
  { name: 'Sun', water: 3490, power: 4300 },
]

const sensorTrends = [
  { time: '00:00', temp: 22, humidity: 60 },
  { time: '04:00', temp: 21, humidity: 62 },
  { time: '08:00', temp: 24, humidity: 55 },
  { time: '12:00', temp: 26, humidity: 50 },
  { time: '16:00', temp: 25, humidity: 52 },
  { time: '20:00', temp: 23, humidity: 58 },
]

const cropDistribution = [
  { name: 'Lettuce', value: 400 },
  { name: 'Basil', value: 300 },
  { name: 'Kale', value: 300 },
  { name: 'Microgreens', value: 200 },
]

const COLORS = ['#3D5654', '#C49646', '#4CAF50', '#81C784']

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Farming Dashboard</h1>
          <p className="text-gray-500">Overview of your vertical farm operations</p>
        </div>
        <div className="flex items-center gap-4">
           {/* Decorative plant vector */}
           <svg className="w-12 h-12 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17,8C8,10 5.9,16.17 3.82,21.34L5.71,22L6.66,19.7C7.14,19.87 7.64,20 8,20C19,20 22,3 22,3C21,5 14,5.25 9,6.25C4,7.25 2,11.5 2,13.5C2,15.5 3.75,17.25 3.75,17.25C7,8 17,8 17,8Z" />
           </svg>
        </div>
      </div>

      {/* Top Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-primary text-primary-foreground rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Overall Crop Health</h3>
            <div className="text-4xl font-bold mb-4">98%</div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <TrendingUp className="w-4 h-4" />
              <span>+2.4% from last week</span>
            </div>
          </div>
          <Leaf className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20" />
        </div>

        <div className="bg-sidebar text-sidebar-foreground rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Water Usage</h3>
            <div className="text-4xl font-bold mb-4">1,240<span className="text-xl">L</span></div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Droplet className="w-4 h-4" />
              <span>Daily Average</span>
            </div>
          </div>
          <Droplet className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
        </div>

        <div className="bg-sidebar text-sidebar-foreground rounded-3xl p-6 shadow-sm relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-lg font-medium opacity-90 mb-1">Power Consumption</h3>
            <div className="text-4xl font-bold mb-4">340<span className="text-xl">kWh</span></div>
            <div className="flex items-center gap-2 text-sm opacity-90">
              <Zap className="w-4 h-4" />
              <span>Daily Average</span>
            </div>
          </div>
          <Zap className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10" />
        </div>
      </div>

      {/* Middle Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Alerts & Recommendations</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4 p-4 border border-red-100 bg-red-50 rounded-2xl">
              <div className="bg-red-100 p-2 rounded-full text-red-600">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-red-800">High Temperature Detected</h4>
                <p className="text-sm text-red-600 mb-2">Zone A currently at 28°C (Threshold: 26°C)</p>
                <div className="inline-flex items-center gap-1 text-xs font-medium bg-white px-3 py-1 rounded-full border border-red-200 text-red-700">
                  <Zap className="w-3 h-3" /> AI Suggestion: Turn on Fan A
                </div>
              </div>
            </div>
            
            <div className="flex items-start gap-4 p-4 border border-green-100 bg-green-50 rounded-2xl">
              <div className="bg-green-100 p-2 rounded-full text-green-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-semibold text-green-800">Nutrient Levels Optimal</h4>
                <p className="text-sm text-green-600">All zones report normal pH and EC levels.</p>
              </div>
            </div>
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
          <div className="h-64 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cropDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
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
              <span className="text-sm text-gray-500">Total</span>
              <span className="text-2xl font-bold text-gray-800">1.2k</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-card rounded-3xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Historical Sensor Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sensorTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          </div>
        </div>
      </div>
    </div>
  )
}
