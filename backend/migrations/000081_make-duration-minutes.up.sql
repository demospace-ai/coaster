ALTER TABLE listings ADD COLUMN duration_minutes BIGINT;
UPDATE listings SET duration_minutes = duration_hours * 60;
ALTER TABLE listings DROP COLUMN duration_hours;