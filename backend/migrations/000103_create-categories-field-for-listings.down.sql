ALTER TABLE listings ADD COLUMN IF NOT EXISTS category VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE listings ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT FALSE;
UPDATE listings SET category = listing_categories.category FROM listing_categories WHERE listing_categories.listing_id = listings.id;
UPDATE listings SET featured = true FROM listing_categories WHERE listing_categories.listing_id = listings.id AND listing_categories.category = 'featured';
DROP TABLE IF EXISTS listing_categories;