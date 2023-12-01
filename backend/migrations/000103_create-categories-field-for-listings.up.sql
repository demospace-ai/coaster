CREATE TABLE IF NOT EXISTS listing_categories (
  id            BIGSERIAL PRIMARY KEY,
  listing_id    BIGINT NOT NULL REFERENCES listings(id),
  category      VARCHAR(64) NOT NULL,

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

INSERT INTO listing_categories (listing_id, category, created_at, updated_at) SELECT id, category, NOW(), NOW() FROM listings;
INSERT INTO listing_categories (listing_id, category, created_at, updated_at) SELECT id, 'featured', NOW(), NOW() FROM listings where featured = TRUE;
ALTER TABLE listings DROP COLUMN IF EXISTS category;
ALTER TABLE listings DROP COLUMN IF EXISTS featured;
CREATE INDEX listing_categories_listing_id_idx ON listing_categories(listing_id);