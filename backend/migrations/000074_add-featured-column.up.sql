ALTER TABLE listings ADD COLUMN featured BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE listings ALTER COLUMN featured DROP DEFAULT;
CREATE INDEX listing_featured_idx ON listings(featured);