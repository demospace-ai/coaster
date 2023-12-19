CREATE TABLE IF NOT EXISTS itinerary_steps (
  id             BIGSERIAL PRIMARY KEY,
  listing_id     BIGINT NOT NULL REFERENCES listings(id),
  title          VARCHAR(256) NOT NULL,
  description    TEXT NOT NULL,
  step_label     VARCHAR(64) NOT NULL,
  step_order     INTEGER NOT NULL,

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX itinerary_steps_listing_id_idx ON itinerary_steps(listing_id);