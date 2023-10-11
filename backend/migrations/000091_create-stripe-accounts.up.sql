ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_id VARCHAR(256);
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_account_status VARCHAR(16) DEFAULT 'incomplete';
ALTER TABLE users ALTER COLUMN stripe_account_status DROP DEFAULT;