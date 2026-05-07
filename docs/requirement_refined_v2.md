# Refined MVP Requirements

## 1. Project Summary
This MVP is a multi-page web demo for one vertical farming rack. The goal is to show a dashboard, a 3D digital twin, and an automated control system that help users monitor sensor data, visualize device states, automate agriculture tasks, see alerts, and receive AI-generated recommendations and automation settings for immediate control actions.

## 2. MVP Scope
### Must Have
- One dashboard page showing latest sensor readings, active alerts, latest AI recommendation, and a simple history chart.
- One 3D digital twin page showing one rack with plants, LED light, fan, water pump, and water reservoir.
- One automated control system page for configuring automated agriculture tasks.
- Threshold-based alerts for temperature, water level, water pH, and soil moisture.
- Rule-based recommendation generation through FastAPI.
- AI-assisted automation settings generation through FastAPI.
- Manual device status update for at least one device during the demo.
- Manual automation scheduling for LED, fan, and water pump.
- One-click AI automation configuration apply feature.
- Mock-first data flow shared across dashboard, automation page, and 3D twin.

### Nice to Have
- Save records to Supabase or Neon after the mock flow is working.
- More polished charts and component detail panels.
- Optional hardware or IoT data input.
- Optional OpenAI or LLM-generated wording for recommendations.
- Automation history logs and execution timeline.
- Electricity and water consumption estimation.

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
| Member 2: AI Engine | Build the recommendation and automation service | FastAPI `/recommendation` endpoint, FastAPI `/automation/recommend` endpoint, rule-based logic, sample input/output payloads | Shared interfaces and plant profile shape from Member 3 |
| Member 3: Frontend + Backend | Build UI, API routes, mock data flow, automation system, and integration | Dashboard page, automation page, Next.js API routes, mock data, device update flow, automation flow, FastAPI integration, shared interfaces | Recommendation response contract from Member 2 and twin prop contract for Member 1 |

## 4. Simple System Architecture
- Next.js frontend displays three pages: a dashboard page, a 3D digital twin page, and an automated control system page.
- Next.js API routes provide dashboard data, sensor history, device state updates, automation settings, and recommendation generation.
- FastAPI exposes recommendation and automation endpoints and returns simple rule-based recommendations and automation settings based on the latest sensor reading and plant profile.
- Supabase or Neon can store basic records after the mock flow works, but the first demo should run with mock data.
- The 3D twin does not call the backend directly. It receives shared state from the parent page.
- The automation system uses shared state and simulated execution flow for automatic device triggering.

## 5. Shared Data Interfaces
```ts
type DeviceStatus = "normal" | "warning" | "critical" | "off" | "on";
type AlertSeverity = "info" | "warning" | "critical";
type AutomationMode = "manual" | "ai";

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

interface AutomationSettings {
  mode: AutomationMode;

  ledStartTime: string;
  ledEndTime: string;
  ledSpectrum: "blue" | "red" | "white" | "mixed";

  fanTriggerTemperature: number;

  pumpIntervalMinutes: number;
  pumpDurationSeconds: number;
}

interface AIAutomationRecommendation {
  cropName: string;

  recommendedLedHours: number;
  recommendedSpectrum: string;

  recommendedFanTemperature: number;

  recommendedPumpInterval: number;
  recommendedPumpDuration: number;

  confidence: number;
}

interface DigitalTwinState {
  sensorReading: SensorReading;
  deviceState: DeviceState;
  alerts: Alert[];
  recommendation: Recommendation;
  automationSettings: AutomationSettings;
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
  automationSettings: AutomationSettings;
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

### POST /api/automation/manual
- Purpose: Save manual automation settings for LED, fan, and pump.
- Request body:
```ts
{
  mode: "manual";
  ledStartTime: string;
  ledEndTime: string;
  ledSpectrum: "blue" | "red" | "white" | "mixed";
  fanTriggerTemperature: number;
  pumpIntervalMinutes: number;
  pumpDurationSeconds: number;
}
```
- Response body:
```ts
{
  automationSettings: AutomationSettings;
}
```
- Owner: Member 3

### POST /api/automation/ai-generate
- Purpose: Send latest sensor data and plant profile to FastAPI, then return AI-generated automation settings.
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
  aiAutomationRecommendation: AIAutomationRecommendation;
}
```
- Owner: Member 3

### POST /api/automation/apply-ai
- Purpose: Apply AI-generated automation settings directly to the current automation profile.
- Request body:
```ts
{
  aiAutomationRecommendation: AIAutomationRecommendation;
}
```
- Response body:
```ts
{
  automationSettings: AutomationSettings;
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

### POST /automation/recommend
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
  aiAutomationRecommendation: AIAutomationRecommendation;
}
```
- Rules:
  - Start with rule-based logic only.
  - Return one clear recommendation focused on immediate control action.
  - Return AI-generated automation settings based on plant profile and latest sensor readings.
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

### automation_profiles
- Important fields: mode, led_start_time, led_end_time, led_spectrum, fan_trigger_temperature, pump_interval_minutes, pump_duration_seconds, created_at
- Purpose: Store manual and AI-generated automation settings

### automation_logs
- Important fields: device_type, action, triggered_by, executed_at
- Purpose: Store automation execution history for demo playback and monitoring

### plant_profile
- Important fields: crop_name, safe_temperature_range, safe_humidity_range, safe_soil_moisture_range, safe_water_ph_range, safe_water_level_range
- Purpose: Store the simple plant thresholds used by the recommendation rules

## 10. Demo Flow
1. Open the dashboard page.
2. Show the latest sensor data, active alerts, latest recommendation, and history chart.
3. Open the automated control system page.
4. Select a plant profile.
5. Generate AI automation settings.
6. Apply AI automation settings with one click.
7. Open the 3D digital twin page.
8. Mock temperature becomes too high.
9. A high-temperature alert appears on the dashboard.
10. The fan changes to a warning color in the 3D twin.
11. The AI engine recommends turning on the fan.
12. The automated control system activates the fan automatically based on the configured threshold.
13. The dashboard and 3D twin reflect the updated state.
14. The pump and LED follow the configured automation schedule.

## 11. Acceptance Criteria
### Dashboard
- [ ] Shows latest temperature, humidity, soil moisture, water pH, and water level.
- [ ] Shows a simple historical chart from mock or stored readings.
- [ ] Shows active alerts clearly.
- [ ] Shows the latest recommendation clearly.

### Automated Control System
- [ ] Allows manual automation scheduling for LED, fan, and pump.
- [ ] Allows users to generate AI automation settings.
- [ ] Allows one-click AI automation apply.
- [ ] Automatically triggers devices based on configured settings.
- [ ] Shares consistent state with dashboard and 3D twin.

### 3D Digital Twin
- [ ] Displays one vertical farming rack only.
- [ ] Includes plants, LED light, fan, water pump, and water reservoir.
- [ ] Changes component color or status based on shared state.
- [ ] Returns clicked component information to the parent view.

### AI Engine
- [ ] Exposes one FastAPI `POST /recommendation` endpoint.
- [ ] Exposes one FastAPI POST /automation/recommend endpoint. 
- [ ] Accepts latest sensor data and plant profile.
- [ ] Returns one clear rule-based recommendation.
- [ ] Returns AI-generated automation settings.

### Backend/API
- [ ] `GET /api/dashboard` returns the latest dashboard state.
- [ ] `GET /api/sensors/history` returns chart data.
- [ ] `POST /api/recommendation/generate` calls FastAPI and returns one recommendation.
- [ ] `POST /api/automation/manual` saves automation settings.
- [ ] `POST /api/automation/ai-generate` calls FastAPI and returns AI automation settings.
- [ ] `POST /api/automation/apply-ai` applies AI automation settings.
- [ ] `PATCH /api/device` updates one device status for demo use.

### Final Demo
- [ ] The team can demonstrate the full flow using mock-first data.
- [ ] An alert and recommendation can be triggered during the demo.
- [ ] Automated device actions can be demonstrated during the demo.
- [ ] AI automation configuration can be generated and applied.
- [ ] The dashboard and 3D twin stay consistent with the same shared state.

## 12. Development Order
1. Define shared interfaces and mock data.
2. Build the dashboard UI with mock state.
3. Build the automated control system page with mock automation settings.
4. Build the 3D digital twin using the same mock state.
5. Build the FastAPI recommendation and automation endpoints with rule-based logic.
6. Connect Next.js API routes to FastAPI.
7. Add automation execution simulation flow.
8. Add Supabase or Neon only after the mock flow works end to end.
9. Polish the demo and prepare the presentation flow.
