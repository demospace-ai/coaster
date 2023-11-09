ALTER TABLE listings ADD COLUMN IF NOT EXISTS availability_display VARCHAR(16) NOT NULL DEFAULT 'calendar';
ALTER TABLE listings ALTER COLUMN availability_display DROP DEFAULT;