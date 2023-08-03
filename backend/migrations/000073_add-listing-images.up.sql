CREATE TABLE listing_images (
    id           BIGSERIAL PRIMARY KEY,
    listing_id   BIGINT NOT NULL REFERENCES listings(id),
    storage_id   VARCHAR(128) NOT NULL, -- UUID v4 used to identify the image in GCS

    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX listing_images_listing_id_idx ON listing_images(listing_id);

ALTER TABLE listings ADD COLUMN published BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE listings ALTER COLUMN published DROP DEFAULT;