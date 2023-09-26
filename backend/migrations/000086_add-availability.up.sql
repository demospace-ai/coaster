CREATE TABLE IF NOT EXISTS availability_rules (
  id               BIGSERIAL PRIMARY KEY,
  listing_id       BIGINT NOT NULL REFERENCES listings(id),
  type             VARCHAR(16) NOT NULL,
  start_date       DATE,
  end_date         DATE,
  recurring_years  SMALLINT[],
  recurring_months SMALLINT[],

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS time_slots (
  id                   BIGSERIAL PRIMARY KEY,
  availability_rule_id BIGINT NOT NULL REFERENCES availability_rules(id),
  capacity             SMALLINT NOT NULL,
  day_of_week          SMALLINT,
  start_time           TIME WITH TIME ZONE,

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE IF NOT EXISTS bookings (
  id                   BIGSERIAL PRIMARY KEY,
  listing_id           BIGINT NOT NULL REFERENCES listings(id),
  time_slot_id         BIGINT NOT NULL REFERENCES time_slots(id),
  start_date           DATE NOT NULL,
  guests               SMALLINT NOT NULL,

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE listings ADD COLUMN IF NOT EXISTS availability_type VARCHAR(10) NOT NULL DEFAULT '';

CREATE INDEX bookings_listing_id_idx ON bookings(listing_id);
CREATE INDEX bookings_time_slot_id_idx ON bookings(time_slot_id);
CREATE INDEX time_slots_availability_rule_id_idx ON time_slots(availability_rule_id);
CREATE INDEX availability_rules_listing_id_idx ON availability_rules(listing_id);