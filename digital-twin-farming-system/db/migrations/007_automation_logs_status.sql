-- Alter automation_logs to support multiple device statuses per entry
ALTER TABLE automation_logs
DROP COLUMN device_type,
DROP COLUMN action,
ADD COLUMN led_status text,
ADD COLUMN fan_status text,
ADD COLUMN pump_status text;

-- Add check constraints for the new status columns
ALTER TABLE automation_logs
ADD CONSTRAINT check_led_status CHECK (led_status IN ('on', 'off')),
ADD CONSTRAINT check_fan_status CHECK (fan_status IN ('on', 'off')),
ADD CONSTRAINT check_pump_status CHECK (pump_status IN ('on', 'off'));
