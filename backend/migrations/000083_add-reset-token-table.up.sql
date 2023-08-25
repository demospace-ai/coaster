CREATE TABLE IF NOT EXISTS reset_tokens (
  id         BIGSERIAL PRIMARY KEY,
  user_id    BIGINT NOT NULL REFERENCES users(id),
  token      VARCHAR(256) NOT NULL,

  created_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  updated_at     TIMESTAMP WITH TIME ZONE NOT NULL,
  deactivated_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX reset_tokens_user_id_idx ON reset_tokens(user_id);