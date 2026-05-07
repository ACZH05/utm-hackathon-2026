-- Store manual and AI-assisted automation settings
CREATE TABLE IF NOT EXISTS automation_profiles (
  id bigserial PRIMARY KEY,
  mode text NOT NULL, -- 'manual' | 'ai'
  led_start_time text NOT NULL, -- e.g., '06:00'
  led_end_time text NOT NULL,   -- e.g., '20:00'
  led_spectrum text NOT NULL,   -- 'blue' | 'red' | 'white' | 'mixed'
  fan_trigger_temperature numeric(6, 2) NOT NULL,
  pump_interval_minutes integer NOT NULL,
  pump_duration_seconds integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (mode IN ('manual', 'ai')),
  CHECK (led_spectrum IN ('blue', 'red', 'white', 'mixed'))
);

-- Optional: Track automation execution history
CREATE TABLE IF NOT EXISTS automation_logs (
  id bigserial PRIMARY KEY,
  device_type text NOT NULL, -- 'led' | 'fan' | 'pump'
  action text NOT NULL,      -- 'on' | 'off'
  triggered_by text NOT NULL, -- 'manual' | 'ai' | 'simulation'
  message text,
  executed_at timestamptz NOT NULL DEFAULT now(),
  CHECK (device_type IN ('led', 'fan', 'pump')),
  CHECK (action IN ('on', 'off')),
  CHECK (triggered_by IN ('manual', 'ai', 'simulation'))
);

CREATE INDEX IF NOT EXISTS automation_profiles_created_at_idx
  ON automation_profiles (created_at DESC);

CREATE INDEX IF NOT EXISTS automation_logs_executed_at_idx
  ON automation_logs (executed_at DESC);

-- Initialize with default settings
INSERT INTO automation_profiles (
  mode, led_start_time, led_end_time, led_spectrum, 
  fan_trigger_temperature, pump_interval_minutes, pump_duration_seconds
) VALUES (
  'manual', '06:00', '20:00', 'mixed', 26.0, 45, 20
);
