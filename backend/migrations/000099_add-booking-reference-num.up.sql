ALTER TABLE bookings ADD COLUMN reference VARCHAR(16) NOT NULL DEFAULT UPPER(SUBSTR(MD5(RANDOM()::TEXT), 0, 16));
ALTER TABLE bookings ALTER COLUMN reference DROP DEFAULT;
CREATE INDEX bookings_reference_idx ON bookings(reference);