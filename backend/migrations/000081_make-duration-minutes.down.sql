ALTER TABLE listings ADD COLUMN duration_hours SMALLINT;
UPDATE listings SET duration_hours = duration_minutes / 60;
ALTER TABLE listings DROP COLUMN duration_minutes;