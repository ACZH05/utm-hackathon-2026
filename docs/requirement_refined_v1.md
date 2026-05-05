# Refined MVP Requirements

## 1. Project Summary
This MVP is a two-page web demo for one vertical farming rack. The goal is to show a simple dashboard and a simple 3D digital twin that help users monitor sensor data, see alerts, and receive one clear AI recommendation for immediate control actions.

## 2. MVP Scope
### Must Have
- One dashboard page showing latest sensor readings, active alerts, latest AI recommendation, and a simple history chart.
- One 3D digital twin page showing one rack with plants, LED light, fan, water pump, and water reservoir.
- Threshold-based alerts for temperature, water level, water pH, and soil moisture.
- One rule-based recommendation generated through FastAPI.
- Manual device status update for at least one device during the demo.
- Mock-first data flow shared across dashboard and 3D twin.

### Nice to Have
- Save records to Supabase or Neon after the mock flow is working.
- More polished charts and component detail panels.
- Optional hardware or IoT data input.
- Optional OpenAI or LLM-generated wording for recommendations.

### Out of Scope
- Authentication and user accounts.
- MQTT, WebSockets, or live streaming infrastructure.
- Multi-user collaboration.
- Complex ML prediction, forecasting, or yield optimization.
- Multiple racks or large-scale farm management.
- FastAPI direct database access.

## 3. Team Responsibilities
| Member | Responsibility | Deliverables | Depends On |
| --- | --- | --- | --- |
| Member 1: 3D Digital Twin | Build the 3D rack visualization and component interaction | Rack scene, component color/status mapping, click handling, selected component panel | Shared interfaces and mock state from Member 3 |
| Member 2: AI Engine | Build the simple recommendation service | FastAPI `/recommendation` endpoint, rule-based logic, sample input/output payloads | Shared interfaces and plant profile shape from Member 3 |
| Member 3: Frontend + Backend | Build UI, API routes, mock data flow, and integration | Dashboard page, Next.js API routes, mock data, device update flow, FastAPI integration, shared interfaces | Recommendation response contract from Member 2 and twin prop contract for Member 1 |

## 4. Simple System Architecture
- Next.js frontend displays two pages: a dashboard page and a 3D digital twin page.
- Next.js API routes provide dashboard data, sensor history, device state updates, and recommendation generation.
- FastAPI exposes one recommendation endpoint and returns one simple recommendation based on the latest sensor reading and plant profile.
- Supabase or Neon can store basic records after the mock flow works, but the first demo should run with mock data.
- The 3D twin does not call the backend directly. It receives shared state from the parent page.

## 5. Shared Data Interfaces
```ts
type DeviceStatus = "normal" | "warning" | "critical" | "off" | "on";
type AlertSeverity = "info" | "warning" | "critical";

interface SensorReading {
  temperature: number;
  humidity: number;
  soilMoisture: number;
  waterPh: number;
  waterLevel: number;
  createdAt: string;
}

interface DeviceState {
  ledStatus: DeviceStatus;
  fanStatus: DeviceStatus;
  pumpStatus: DeviceStatus;
  reservoirStatus: DeviceStatus;
}

interface Alert {
  type: string;
  severity: AlertSeverity;
  message: string;
  createdAt: string;
}

interface Recommendation {
  title: string;
  message: string;
  suggestedAction: string;
  severity: AlertSeverity;
  confidence: number;
}

interface DigitalTwinState {
  sensorReading: SensorReading;
  deviceState: DeviceState;
  alerts: Alert[];
  recommendation: Recommendation;
}
```

Note: the UI can use `on` and `off` for manual device state, while `normal`, `warning`, and `critical` can drive color/status visuals.

## 6. Simple API Interfaces
### GET /api/dashboard
- Purpose: Return everything needed for the main dashboard view.
- Request body: None.
- Response body:
```ts
{
  sensorReading: SensorReading;
  deviceState: DeviceState;
  alerts: Alert[];
  recommendation: Recommendation;
}
```
- Owner: Member 3

### GET /api/sensors/history
- Purpose: Return sensor readings for the history chart.
- Request body: None.
- Response body:
```ts
{
  readings: SensorReading[];
}
```
- Owner: Member 3

### POST /api/recommendation/generate
- Purpose: Send latest sensor data and plant profile to FastAPI, then return one recommendation to the frontend.
- Request body:
```ts
{
  sensorReading: SensorReading;
  plantProfile: {
    cropName: string;
    safeTemperatureRange: [number, number];
    safeHumidityRange: [number, number];
    safeSoilMoistureRange: [number, number];
    safeWaterPhRange: [number, number];
    safeWaterLevelRange: [number, number];
  };
}
```
- Response body:
```ts
{
  recommendation: Recommendation;
}
```
- Owner: Member 3

### PATCH /api/device
- Purpose: Update one device status manually for demo interaction.
- Request body:
```ts
{
  device: "led" | "fan" | "pump" | "reservoir";
  status: "normal" | "warning" | "critical" | "off" | "on";
}
```
- Response body:
```ts
{
  deviceState: DeviceState;
}
```
- Owner: Member 3

## 7. FastAPI AI Interface
### POST /recommendation
- Input:
```ts
{
  sensorReading: SensorReading;
  plantProfile: {
    cropName: string;
    safeTemperatureRange: [number, number];
    safeHumidityRange: [number, number];
    safeSoilMoistureRange: [number, number];
    safeWaterPhRange: [number, number];
    safeWaterLevelRange: [number, number];
  };
}
```
- Output:
```ts
{
  recommendation: Recommendation;
}
```
- Rules:
  - Start with rule-based logic only.
  - Return one clear recommendation focused on immediate control action.
  - Do not connect FastAPI directly to the database.
  - Next.js is responsible for calling FastAPI.

## 8. 3D Digital Twin Interface
- The 3D twin receives `DigitalTwinState` as props from the parent page.
- The 3D twin must not call the backend directly.
- It should change component colors or status visuals based on device state and alerts.
- It should emit the clicked component back to the parent so the parent can show details.

### SelectedComponent
```ts
interface SelectedComponent {
  type: "plant" | "led" | "fan" | "pump" | "reservoir";
  name: string;
}
```

## 9. Simple Database Tables
### sensor_readings
- Important fields: temperature, humidity, soil_moisture, water_ph, water_level, created_at
- Purpose: Store historical sensor values for charts and demo playback

### device_states
- Important fields: led_status, fan_status, pump_status, reservoir_status, updated_at
- Purpose: Store current device conditions and manual status changes

### alerts
- Important fields: type, severity, message, created_at, is_active
- Purpose: Store active and recent rule-based alerts

### recommendations
- Important fields: title, message, suggested_action, severity, confidence, created_at
- Purpose: Store the latest AI recommendation and recent recommendation history

### plant_profile
- Important fields: crop_name, safe_temperature_range, safe_humidity_range, safe_soil_moisture_range, safe_water_ph_range, safe_water_level_range
- Purpose: Store the simple plant thresholds used by the recommendation rules

## 10. Demo Flow
1. Open the dashboard page.
2. Show the latest sensor data, active alerts, latest recommendation, and history chart.
3. Open the 3D digital twin page.
4. Mock temperature becomes too high.
5. A high-temperature alert appears on the dashboard.
6. The fan changes to a warning color in the 3D twin.
7. The AI engine recommends turning on the fan.
8. The user updates the fan status manually.
9. The dashboard and 3D twin reflect the updated state.

## 11. Acceptance Criteria
### Dashboard
- [ ] Shows latest temperature, humidity, soil moisture, water pH, and water level.
- [ ] Shows a simple historical chart from mock or stored readings.
- [ ] Shows active alerts clearly.
- [ ] Shows the latest recommendation clearly.

### 3D Digital Twin
- [ ] Displays one vertical farming rack only.
- [ ] Includes plants, LED light, fan, water pump, and water reservoir.
- [ ] Changes component color or status based on shared state.
- [ ] Returns clicked component information to the parent view.

### AI Engine
- [ ] Exposes one FastAPI `POST /recommendation` endpoint.
- [ ] Accepts latest sensor data and plant profile.
- [ ] Returns one clear rule-based recommendation.

### Backend/API
- [ ] `GET /api/dashboard` returns the latest dashboard state.
- [ ] `GET /api/sensors/history` returns chart data.
- [ ] `POST /api/recommendation/generate` calls FastAPI and returns one recommendation.
- [ ] `PATCH /api/device` updates one device status for demo use.

### Final Demo
- [ ] The team can demonstrate the full flow using mock-first data.
- [ ] An alert and recommendation can be triggered during the demo.
- [ ] The dashboard and 3D twin stay consistent with the same shared state.

## 12. Development Order
1. Define shared interfaces and mock data.
2. Build the dashboard UI with mock state.
3. Build the 3D digital twin using the same mock state.
4. Build the FastAPI recommendation endpoint with rule-based logic.
5. Connect Next.js API routes to FastAPI.
6. Add Supabase or Neon only after the mock flow works end to end.
7. Polish the demo and prepare the presentation flow.
