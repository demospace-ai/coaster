ALTER TABLE users ALTER COLUMN about TYPE TEXT;
ALTER TABLE users ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE users ALTER COLUMN is_admin DROP DEFAULT;