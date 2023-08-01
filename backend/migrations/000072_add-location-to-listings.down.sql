ALTER TABLE listings DROP COLUMN location;
ALTER TABLE listings RENAME COLUMN coordinates TO location;