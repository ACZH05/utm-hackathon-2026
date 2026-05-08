-- Seed initial sensor readings for all trays that don't have any
-- Use an interval offset based on the tray ID to ensure unique 'created_at' timestamps
INSERT INTO sensor_readings (
  tray_id,
  temperature,
  humidity,
  soil_moisture,
  water_ph,
  water_level,
  created_at
)
SELECT 
  t.id,
  24.5, -- Baseline temperature
  60.0, -- Baseline humidity
  65.0, -- Baseline soil moisture
  6.2,  -- Baseline pH
  80.0, -- Baseline water level
  now() + (t.id * interval '1 millisecond')
FROM trays t
LEFT JOIN sensor_readings sr ON sr.tray_id = t.id
WHERE sr.id IS NULL;

-- Seed initial device states for all trays that don't have any
INSERT INTO device_states (
  tray_id,
  led_status,
  fan_status,
  pump_status,
  reservoir_status,
  updated_at
)
SELECT 
  t.id,
  'off',
  'off',
  'normal',
  'normal',
  now()
FROM trays t
LEFT JOIN device_states ds ON ds.tray_id = t.id
WHERE ds.tray_id IS NULL;
