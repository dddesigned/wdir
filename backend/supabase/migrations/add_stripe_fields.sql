-- Add Stripe payment tracking fields to licenses table
ALTER TABLE licenses
ADD COLUMN IF NOT EXISTS stripe_session_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent TEXT,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for faster Stripe session lookups
CREATE INDEX IF NOT EXISTS idx_licenses_stripe_session ON licenses(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_licenses_stripe_payment ON licenses(stripe_payment_intent);
