-- Create 2 more racks
INSERT INTO racks (name) VALUES ('North Rack'), ('South Rack') ON CONFLICT (name) DO NOTHING;

-- Add 4 trays for Main Rack (Total 4, since Tray 1 already exists)
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 2', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'Main Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 3', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'Main Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 4', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'Main Rack' ON CONFLICT (rack_id, name) DO NOTHING;

-- Add 4 trays for North Rack
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 1', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'North Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 2', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'North Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 3', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'North Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 4', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'North Rack' ON CONFLICT (rack_id, name) DO NOTHING;

-- Add 4 trays for South Rack
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 1', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'South Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 2', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'South Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 3', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'South Rack' ON CONFLICT (rack_id, name) DO NOTHING;
INSERT INTO trays (rack_id, name, plant_profile_id)
SELECT id, 'Tray 4', (SELECT id FROM plant_profiles WHERE crop_name = 'Lettuce' LIMIT 1) FROM racks WHERE name = 'South Rack' ON CONFLICT (rack_id, name) DO NOTHING;
