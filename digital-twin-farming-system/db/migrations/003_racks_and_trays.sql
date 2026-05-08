-- Phase 1: Create Racks and Trays
CREATE TABLE IF NOT EXISTS racks (
  id bigserial PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS trays (
  id bigserial PRIMARY KEY,
  rack_id bigint NOT NULL REFERENCES racks(id) ON DELETE CASCADE,
  name text NOT NULL,
  plant_profile_id bigint REFERENCES plant_profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (rack_id, name)
);

-- Phase 2: Add tray_id to existing tables
ALTER TABLE sensor_readings ADD COLUMN IF NOT EXISTS tray_id bigint REFERENCES trays(id) ON DELETE CASCADE;
ALTER TABLE device_states ADD COLUMN IF NOT EXISTS tray_id bigint REFERENCES trays(id) ON DELETE CASCADE;
ALTER TABLE automation_profiles ADD COLUMN IF NOT EXISTS tray_id bigint REFERENCES trays(id) ON DELETE CASCADE;
ALTER TABLE automation_logs ADD COLUMN IF NOT EXISTS tray_id bigint REFERENCES trays(id) ON DELETE CASCADE;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS tray_id bigint REFERENCES trays(id) ON DELETE CASCADE;
ALTER TABLE recommendations ADD COLUMN IF NOT EXISTS tray_id bigint REFERENCES trays(id) ON DELETE CASCADE;

-- Phase 3: Data Migration (Seed default Rack and Tray)
INSERT INTO racks (name) VALUES ('Main Rack') ON CONFLICT (name) DO NOTHING;

INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 1', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1)
FROM racks WHERE name = 'Main Rack'
ON CONFLICT (rack_id, name) DO NOTHING;

-- Associate existing records with the default Tray 1
DO $$
DECLARE
  default_tray_id bigint;
BEGIN
  SELECT t.id INTO default_tray_id 
  FROM trays t 
  JOIN racks r ON t.rack_id = r.id 
  WHERE r.name = 'Main Rack' AND t.name = 'Tray 1' 
  LIMIT 1;

  IF default_tray_id IS NOT NULL THEN
    UPDATE sensor_readings SET tray_id = default_tray_id WHERE tray_id IS NULL;
    UPDATE device_states SET tray_id = default_tray_id WHERE tray_id IS NULL;
    UPDATE automation_profiles SET tray_id = default_tray_id WHERE tray_id IS NULL;
    UPDATE automation_logs SET tray_id = default_tray_id WHERE tray_id IS NULL;
    UPDATE alerts SET tray_id = default_tray_id WHERE tray_id IS NULL;
    UPDATE recommendations SET tray_id = default_tray_id WHERE tray_id IS NULL;
  END IF;
END $$;

-- Phase 4: Enforce NOT NULL on tray_id after migration
ALTER TABLE sensor_readings ALTER COLUMN tray_id SET NOT NULL;
ALTER TABLE device_states ALTER COLUMN tray_id SET NOT NULL;
ALTER TABLE automation_profiles ALTER COLUMN tray_id SET NOT NULL;
ALTER TABLE automation_logs ALTER COLUMN tray_id SET NOT NULL;
ALTER TABLE alerts ALTER COLUMN tray_id SET NOT NULL;
ALTER TABLE recommendations ALTER COLUMN tray_id SET NOT NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS sensor_readings_tray_id_idx ON sensor_readings (tray_id, created_at DESC);
CREATE INDEX IF NOT EXISTS device_states_tray_id_idx ON device_states (tray_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS automation_profiles_tray_id_idx ON automation_profiles (tray_id, created_at DESC);
