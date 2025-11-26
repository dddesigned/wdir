-- WDIR Email-Based Authentication Migration
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/hnhrwyfeljmwjxruoxze/sql

-- ============================================================
-- 1. VERIFICATION CODES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    attempts INT DEFAULT 0,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for fast email lookups
CREATE INDEX IF NOT EXISTS idx_verification_codes_email ON verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expires_at ON verification_codes(expires_at);

-- ============================================================
-- 2. DEVICES TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    device_model TEXT,
    os_version TEXT,
    first_activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_used_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one device per license
    UNIQUE(license_id, device_id)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_devices_license_id ON devices(license_id);
CREATE INDEX IF NOT EXISTS idx_devices_last_used_at ON devices(last_used_at);
CREATE INDEX IF NOT EXISTS idx_devices_device_id ON devices(device_id);

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_devices_updated_at ON devices;
CREATE TRIGGER update_devices_updated_at BEFORE UPDATE ON devices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 3. USAGE STATS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS usage_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_id UUID NOT NULL REFERENCES licenses(id) ON DELETE CASCADE,
    period TEXT NOT NULL, -- Format: YYYY-MM
    report_count INT DEFAULT 0,
    last_reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    -- Unique constraint: one record per license per month
    UNIQUE(license_id, period)
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_usage_stats_license_id ON usage_stats(license_id);
CREATE INDEX IF NOT EXISTS idx_usage_stats_period ON usage_stats(period);

-- Auto-update updated_at timestamp
DROP TRIGGER IF EXISTS update_usage_stats_updated_at ON usage_stats;
CREATE TRIGGER update_usage_stats_updated_at BEFORE UPDATE ON usage_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 4. UPDATE LICENSES TABLE
-- ============================================================

-- Add device count tracking fields
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS device_count INT DEFAULT 0;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS flagged_multi_device BOOLEAN DEFAULT FALSE;
ALTER TABLE licenses ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- Add index for email (case-insensitive)
CREATE INDEX IF NOT EXISTS idx_licenses_email_lower ON licenses(LOWER(email));

-- ============================================================
-- 5. ROW LEVEL SECURITY
-- ============================================================

-- Verification codes
ALTER TABLE verification_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to verification_codes" ON verification_codes;
CREATE POLICY "Service role has full access to verification_codes"
    ON verification_codes FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Devices
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to devices" ON devices;
CREATE POLICY "Service role has full access to devices"
    ON devices FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Usage stats
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Service role has full access to usage_stats" ON usage_stats;
CREATE POLICY "Service role has full access to usage_stats"
    ON usage_stats FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================
-- 6. HELPER FUNCTIONS
-- ============================================================

-- Function to clean up expired verification codes (run periodically)
CREATE OR REPLACE FUNCTION cleanup_expired_verification_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM verification_codes
    WHERE expires_at < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;

-- Function to update device count on license
CREATE OR REPLACE FUNCTION update_license_device_count()
RETURNS TRIGGER AS $$
BEGIN
    -- Update device count for the license
    UPDATE licenses
    SET device_count = (
        SELECT COUNT(DISTINCT device_id)
        FROM devices
        WHERE license_id = NEW.license_id
        AND last_used_at > NOW() - INTERVAL '12 months'
        AND is_active = true
    ),
    flagged_multi_device = (
        SELECT COUNT(DISTINCT device_id) >= 3
        FROM devices
        WHERE license_id = NEW.license_id
        AND last_used_at > NOW() - INTERVAL '12 months'
        AND is_active = true
    )
    WHERE id = NEW.license_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update device count when device is added/updated
DROP TRIGGER IF EXISTS trigger_update_device_count ON devices;
CREATE TRIGGER trigger_update_device_count
    AFTER INSERT OR UPDATE ON devices
    FOR EACH ROW
    EXECUTE FUNCTION update_license_device_count();

-- ============================================================
-- 7. ADMIN EMAIL NOTIFICATION VIEW
-- ============================================================

-- View for licenses that need admin attention (3+ devices)
CREATE OR REPLACE VIEW flagged_licenses AS
SELECT
    l.id,
    l.license_key,
    l.email,
    l.company_name,
    l.inspector_name,
    l.device_count,
    l.flagged_multi_device,
    l.admin_notes,
    COUNT(d.id) as active_device_count,
    json_agg(
        json_build_object(
            'device_id', d.device_id,
            'device_model', d.device_model,
            'last_used_at', d.last_used_at
        ) ORDER BY d.last_used_at DESC
    ) as devices
FROM licenses l
LEFT JOIN devices d ON l.id = d.license_id
    AND d.last_used_at > NOW() - INTERVAL '12 months'
    AND d.is_active = true
WHERE l.flagged_multi_device = true
GROUP BY l.id;

-- ============================================================
-- 8. VERIFICATION
-- ============================================================

SELECT
    'Migration complete!' as status,
    (SELECT COUNT(*) FROM licenses) as licenses_count,
    (SELECT COUNT(*) FROM devices) as devices_count,
    (SELECT COUNT(*) FROM usage_stats) as usage_stats_count,
    (SELECT COUNT(*) FROM verification_codes) as verification_codes_count;
