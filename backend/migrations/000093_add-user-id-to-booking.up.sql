ALTER TABLE bookings ADD COLUMN IF NOT EXISTS user_id BIGINT NOT NULL REFERENCES users(id);