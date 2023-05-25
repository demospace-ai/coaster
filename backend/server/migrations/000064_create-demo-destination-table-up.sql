CREATE TABLE IF NOT EXISTS demo_destinations (
    id BIGSERIAL PRIMARY KEY,
    organization_id BIGINT NOT NULL REFERENCES organizations(id),
    destination_id BIGINT NOT NULL REFERENCES destinations(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_written_sync TEXT
)