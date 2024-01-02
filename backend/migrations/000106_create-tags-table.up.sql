CREATE TABLE IF NOT EXISTS tags (
  id            BIGSERIAL PRIMARY KEY,
  slug          VARCHAR(64) NOT NULL UNIQUE,
  title         VARCHAR(256) NOT NULL,
  description   TEXT NOT NULL,
  image_url     VARCHAR(256),

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS tag_listings (
  id            BIGSERIAL PRIMARY KEY,
  tag_id        BIGINT NOT NULL REFERENCES tags(id),
  listing_id    BIGINT NOT NULL REFERENCES listings(id),

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX tags_slug_idx ON tags(slug);
CREATE INDEX tag_listings_tag_id_idx ON tag_listings(tag_id);