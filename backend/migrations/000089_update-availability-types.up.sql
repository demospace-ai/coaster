UPDATE time_slots SET start_time = '12:00:00'::time WHERE start_time IS NULL;
ALTER TABLE time_slots ALTER COLUMN start_time SET NOT NULL;
ALTER TABLE time_slots ALTER COLUMN capacity DROP NOT NULL;