ALTER TABLE users DROP COLUMN IF EXISTS currency;
ALTER TABLE users DROP COLUMN IF EXISTS commission_percent;

ALTER TABLE bookings DROP COLUMN IF EXISTS expires_at;
ALTER TABLE bookings DROP COLUMN IF EXISTS start_time;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time_slot_id BIGINT NOT NULL REFERENCES time_slots(id);
CREATE INDEX bookings_time_slot_id_idx ON bookings(time_slot_id);