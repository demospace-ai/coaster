CREATE TABLE IF NOT EXISTS payments (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT NOT NULL REFERENCES users(id),
  booking_id    BIGINT NOT NULL REFERENCES bookings(id),
  session_id    VARCHAR(255) NOT NULL,
  total_amount  INTEGER NOT NULL,
  currency      VARCHAR(3) NOT NULL,
  status        VARCHAR(24) NOT NULL,
  checkout_link VARCHAR(512) NOT NULL,
  completed_at  TIMESTAMP WITH TIME ZONE,

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX payments_user_id_idx ON payments(user_id);
CREATE INDEX payments_booking_id_idx ON payments(booking_id);

ALTER TABLE bookings DROP COLUMN IF EXISTS checkout_link;