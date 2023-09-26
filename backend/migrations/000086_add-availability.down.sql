DROP TABLE IF EXISTS bookings;
DROP TABLE IF EXISTS time_slots;
DROP TABLE IF EXISTS availability_rules;
ALTER TABLE listings DROP COLUMN IF EXISTS availability_type;