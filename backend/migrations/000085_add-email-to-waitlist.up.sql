ALTER TABLE waitlist ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';
ALTER TABLE waitlist ALTER COLUMN email DROP DEFAULT;