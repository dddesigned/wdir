# WDIR Backend API

Next.js API for WDIR license management and validation.

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Supabase (PostgreSQL)
- Stripe (payments)
- Tailwind CSS

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your credentials:

```bash
cp .env.local.example .env.local
```

You'll need:
- Supabase project URL and keys (from supabase.com/dashboard)
- Stripe API keys (from stripe.com/dashboard)

### 3. Set Up Supabase Database

Run this SQL in your Supabase SQL Editor:

```sql
-- Licenses table
CREATE TABLE licenses (
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
CREATE INDEX idx_licenses_license_key ON licenses(license_key);
CREATE INDEX idx_licenses_email ON licenses(email);
CREATE INDEX idx_licenses_stripe_customer ON licenses(stripe_customer_id);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_licenses_updated_at BEFORE UPDATE ON licenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE licenses ENABLE ROW LEVEL SECURITY;

-- Allow service role to do everything (for API calls)
CREATE POLICY "Service role has full access to licenses"
    ON licenses FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
```

### 4. Run Development Server

```bash
npm run dev
```

Visit http://localhost:3000

## API Endpoints

### License Management

**POST /api/license/activate**
Activate a license with a license key.

Request:
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX",
  "device_info": {
    "device_id": "xxx",
    "device_model": "iPhone 15 Pro",
    "os_version": "18.0"
  }
}
```

Response:
```json
{
  "success": true,
  "license": {
    "id": "...",
    "company_name": "...",
    "inspector_name": "...",
    ...
  }
}
```

**POST /api/license/validate**
Validate a license (for team licenses monthly check).

Request:
```json
{
  "license_key": "XXXX-XXXX-XXXX-XXXX"
}
```

Response:
```json
{
  "success": true,
  "is_active": true,
  "expires_at": null
}
```

## Deployment

### Vercel

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard under Settings → Environment Variables.

## Testing

### Insert Test License

Run this in Supabase SQL Editor:

```sql
INSERT INTO licenses (
  license_key,
  email,
  company_name,
  inspector_name,
  inspector_license,
  license_type
) VALUES (
  'TEST-1234-5678-9ABC',
  'test@example.com',
  'Texas Termite Pest and Critter Control',
  'John Doe',
  'LIC-12345',
  'individual'
);
```

### Test Activation

```bash
curl -X POST http://localhost:3000/api/license/activate \
  -H "Content-Type: application/json" \
  -d '{"license_key":"TEST-1234-5678-9ABC"}'
```

## Project Structure

```
backend/
├── app/
│   ├── api/
│   │   └── license/
│   │       ├── activate/
│   │       │   └── route.ts
│   │       └── validate/
│   │           └── route.ts
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   └── supabase.ts
├── types/
│   └── license.ts
└── .env.local
```

## Future Features

- [ ] Stripe checkout integration
- [ ] Admin dashboard for manual license creation
- [ ] Team/business license management
- [ ] License analytics and reporting
- [ ] Webhook handlers for Stripe events
