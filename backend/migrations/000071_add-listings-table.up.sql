CREATE EXTENSION IF NOT EXISTS postgis;
CREATE TABLE listings (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT NOT NULL REFERENCES users(id),
    category     VARCHAR(32) NOT NULL,
    name         VARCHAR(128) NOT NULL,
    description  TEXT NOT NULL,
    price        BIGINT NOT NULL,
    location     geography(POINT) NOT NULL,

    created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
    deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX listings_user_id_idx ON listings(user_id);
CREATE INDEX listings_geo_index ON listings USING GIST (location);