-- WDIR License Management Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hnhrwyfeljmwjxruoxze/sql

-- Licenses table
CREATE TABLE IF NOT EXISTS licenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_key TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,

    -- Company details (synced to iOS on activation)
    company_name TEXT NOT NULL,
    company_phone TEXT,
    company_license_number TEXT,
    inspector_name TEXT NOT NULL,
    inspector_license TEXT NOT NULL,

    -- License type
    license_type TEXT NOT NULL DEFAULT 'individual',

    -- Lifecycle
    purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    activated_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,

    -- Team licenses (future)
    business_id UUID,
    assigned_by UUID,
    assigned_at TIMESTAMPTZ,

    -- Payment
    stripe_customer_id TEXT,
    stripe_payment_intent_id TEXT,

    -- Metadata
    last_validated_at TIMESTAMPTZ,
    device_info JSONB,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_licenses_license_key ON licenses(license_key);
CREATE INDEX IF NOT EXISTS idx_licenses_email ON licenses(email);
CREATE INDEX IF NOT EXISTS idx_licenses_stripe_customer ON licenses(stripe_customer_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_licenses_updated_at ON licenses;
CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Service role has full access to licenses" ON licenses;

-- Allow service role to do everything (for API calls)
CREATE POLICY "Service role has full access to licenses"
    ON licenses FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Insert a test license for development
INSERT INTO licenses (
  license_key,
  email,
  company_name,
  company_phone,
  company_license_number,
  inspector_name,
  inspector_license,
  license_type
) VALUES (
  'TEST-1234-5678-9ABC',
  'test@example.com',
  'Texas Termite Pest and Critter Control',
  '(555) 123-4567',
  'SPC-TX-12345',
  'John Doe',
  'LIC-12345',
  'individual'
) ON CONFLICT (license_key) DO NOTHING;

-- Verify table was created
SELECT 'Setup complete! Table created with ' || COUNT(*)::text || ' test license(s).' as status
FROM licenses;
