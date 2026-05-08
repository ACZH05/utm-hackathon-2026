-- Add more plant profiles
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
  is_active
)
VALUES
  ('Basil', 20, 30, 40, 60, 50, 80, 5.5, 6.5, 40, 100, true),
  ('Kale', 15, 23, 50, 80, 60, 90, 6.0, 7.5, 30, 100, true)
ON CONFLICT (crop_name) DO NOTHING;

-- Assign Lettuce to all trays in 'Main Rack'
UPDATE trays
SET plant_profile_id = (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1)
WHERE rack_id = (SELECT id FROM racks WHERE name = 'Main Rack' LIMIT 1);

-- Assign Basil to all trays in 'North Rack'
UPDATE trays
SET plant_profile_id = (SELECT id FROM plant_profiles WHERE crop_name = 'Basil' LIMIT 1)
WHERE rack_id = (SELECT id FROM racks WHERE name = 'North Rack' LIMIT 1);

-- Assign Kale to all trays in 'South Rack'
UPDATE trays
SET plant_profile_id = (SELECT id FROM plant_profiles WHERE crop_name = 'Kale' LIMIT 1)
WHERE rack_id = (SELECT id FROM racks WHERE name = 'South Rack' LIMIT 1);
