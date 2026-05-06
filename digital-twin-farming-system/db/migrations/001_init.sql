CREATE TABLE IF NOT EXISTS plant_profiles (
  id bigserial PRIMARY KEY,
  crop_name text NOT NULL UNIQUE,
  safe_temperature_min numeric(6, 2) NOT NULL,
  safe_temperature_max numeric(6, 2) NOT NULL,
  safe_humidity_min numeric(6, 2) NOT NULL,
  safe_humidity_max numeric(6, 2) NOT NULL,
  safe_soil_moisture_min numeric(6, 2) NOT NULL,
  safe_soil_moisture_max numeric(6, 2) NOT NULL,
  safe_water_ph_min numeric(4, 2) NOT NULL,
  safe_water_ph_max numeric(4, 2) NOT NULL,
  safe_water_level_min numeric(6, 2) NOT NULL,
  safe_water_level_max numeric(6, 2) NOT NULL,
  is_active boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (safe_temperature_min <= safe_temperature_max),
  CHECK (safe_humidity_min <= safe_humidity_max),
  CHECK (safe_soil_moisture_min <= safe_soil_moisture_max),
  CHECK (safe_water_ph_min <= safe_water_ph_max),
  CHECK (safe_water_level_min <= safe_water_level_max)
);

CREATE TABLE IF NOT EXISTS sensor_readings (
  id bigserial PRIMARY KEY,
  temperature numeric(6, 2) NOT NULL,
  humidity numeric(6, 2) NOT NULL,
  soil_moisture numeric(6, 2) NOT NULL,
  water_ph numeric(4, 2) NOT NULL,
  water_level numeric(6, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (created_at)
);

CREATE TABLE IF NOT EXISTS device_states (
  id bigserial PRIMARY KEY,
  led_status text NOT NULL,
  fan_status text NOT NULL,
  pump_status text NOT NULL,
  reservoir_status text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (led_status IN ('normal', 'warning', 'critical', 'off', 'on')),
  CHECK (fan_status IN ('normal', 'warning', 'critical', 'off', 'on')),
  CHECK (pump_status IN ('normal', 'warning', 'critical', 'off', 'on')),
  CHECK (reservoir_status IN ('normal', 'warning', 'critical', 'off', 'on'))
);

CREATE TABLE IF NOT EXISTS alerts (
  id bigserial PRIMARY KEY,
  type text NOT NULL,
  severity text NOT NULL,
  message text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true,
  CHECK (severity IN ('info', 'warning', 'critical')),
  UNIQUE (type, message, created_at)
);

CREATE TABLE IF NOT EXISTS recommendations (
  id bigserial PRIMARY KEY,
  title text NOT NULL,
  message text NOT NULL,
  suggested_action text NOT NULL,
  severity text NOT NULL,
  confidence numeric(4, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (severity IN ('info', 'warning', 'critical')),
  CHECK (confidence >= 0 AND confidence <= 1)
);

CREATE INDEX IF NOT EXISTS sensor_readings_created_at_idx
  ON sensor_readings (created_at DESC);

CREATE INDEX IF NOT EXISTS device_states_updated_at_idx
  ON device_states (updated_at DESC);

CREATE INDEX IF NOT EXISTS alerts_active_created_at_idx
  ON alerts (is_active, created_at DESC);

CREATE INDEX IF NOT EXISTS recommendations_created_at_idx
  ON recommendations (created_at DESC);

INSERT INTO plant_profiles (
  crop_name,
  safe_temperature_min,
  safe_temperature_max,
  safe_humidity_min,
  safe_humidity_max,
  safe_soil_moisture_min,
  safe_soil_moisture_max,
  safe_water_ph_min,
  safe_water_ph_max,
  safe_water_level_min,
  safe_water_level_max,
  is_active,
  created_at,
  updated_at
)
VALUES (
  'Lettuce',
  18,
  26,
  50,
  75,
  45,
  70,
  5.8,
  6.8,
  35,
  100,
  true,
  '2026-05-05T00:00:00Z',
  '2026-05-05T00:00:00Z'
)
ON CONFLICT (crop_name) DO UPDATE
SET
  safe_temperature_min = EXCLUDED.safe_temperature_min,
  safe_temperature_max = EXCLUDED.safe_temperature_max,
  safe_humidity_min = EXCLUDED.safe_humidity_min,
  safe_humidity_max = EXCLUDED.safe_humidity_max,
  safe_soil_moisture_min = EXCLUDED.safe_soil_moisture_min,
  safe_soil_moisture_max = EXCLUDED.safe_soil_moisture_max,
  safe_water_ph_min = EXCLUDED.safe_water_ph_min,
  safe_water_ph_max = EXCLUDED.safe_water_ph_max,
  safe_water_level_min = EXCLUDED.safe_water_level_min,
  safe_water_level_max = EXCLUDED.safe_water_level_max,
  is_active = EXCLUDED.is_active,
  updated_at = EXCLUDED.updated_at;

INSERT INTO sensor_readings (
  temperature,
  humidity,
  soil_moisture,
  water_ph,
  water_level,
  created_at
)
VALUES
  (24.1, 62, 64, 6.2, 83, '2026-05-05T01:00:00Z'),
  (24.8, 63, 63, 6.2, 81, '2026-05-05T02:00:00Z'),
  (25.6, 64, 61, 6.3, 79, '2026-05-05T03:00:00Z'),
  (26.9, 65, 60, 6.3, 77, '2026-05-05T04:00:00Z'),
  (28.4, 66, 59, 6.3, 75, '2026-05-05T05:00:00Z'),
  (29.6, 67, 58, 6.4, 74, '2026-05-05T06:00:00Z'),
  (30.5, 67, 58, 6.4, 73, '2026-05-05T07:00:00Z'),
  (31.8, 67, 58, 6.3, 72, '2026-05-05T08:20:00Z')
ON CONFLICT (created_at) DO UPDATE
SET
  temperature = EXCLUDED.temperature,
  humidity = EXCLUDED.humidity,
  soil_moisture = EXCLUDED.soil_moisture,
  water_ph = EXCLUDED.water_ph,
  water_level = EXCLUDED.water_level;

INSERT INTO device_states (
  led_status,
  fan_status,
  pump_status,
  reservoir_status,
  updated_at
)
SELECT
  'on',
  'off',
  'normal',
  'normal',
  '2026-05-05T08:20:00Z'
WHERE NOT EXISTS (
  SELECT 1 FROM device_states WHERE updated_at = '2026-05-05T08:20:00Z'
);

INSERT INTO alerts (
  type,
  severity,
  message,
  created_at,
  is_active
)
VALUES (
  'temperature',
  'warning',
  'Temperature is above the Lettuce safe range of 18-26°C.',
  '2026-05-05T08:20:00Z',
  true
)
ON CONFLICT (type, message, created_at) DO UPDATE
SET
  severity = EXCLUDED.severity,
  is_active = EXCLUDED.is_active;

INSERT INTO recommendations (
  title,
  message,
  suggested_action,
  severity,
  confidence,
  created_at
)
SELECT
  'Turn on cooling fan',
  'Lettuce rack temperature is too high. Turn on the fan to bring the rack back into the safe range.',
  'Set fan status to on',
  'warning',
  0.86,
  '2026-05-05T08:20:00Z'
WHERE NOT EXISTS (
  SELECT 1
  FROM recommendations
  WHERE title = 'Turn on cooling fan'
    AND created_at = '2026-05-05T08:20:00Z'
);
