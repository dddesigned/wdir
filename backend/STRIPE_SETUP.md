# Stripe Payment Integration Setup

The automated license purchase system is now ready! Here's how to complete the setup:

## 1. Get Your Stripe API Keys

1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** and **Secret key**
3. Update `.env.local` with these values:

```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
```

## 2. Set Up Stripe Webhook

The webhook is needed to automatically create licenses after successful payments.

### Local Development (using Stripe CLI):

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Login to Stripe:
   ```bash
   stripe login
   ```
3. Forward webhooks to your local server:
   ```bash
   stripe listen --forward-to http://localhost:3001/api/webhooks/stripe
   ```
4. Copy the webhook signing secret (starts with `whsec_`) and add to `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
   ```

### Production:

1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. Enter your production URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select event: `checkout.session.completed`
5. Copy the signing secret and add to production environment variables

## 3. Apply Database Migration

Run the migration to add Stripe payment tracking fields:

```bash
# If using Supabase CLI:
supabase db push

# Or manually run the SQL in:
# supabase/migrations/add_stripe_fields.sql
```

## 4. Test the Flow

1. Visit http://localhost:3001
2. Click "Get Started" or "Purchase License"
3. Fill in license details
4. Click "Continue to Payment"
5. Use Stripe test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC
   - Any ZIP code
6. Complete payment
7. Check that:
   - License is created in database
   - Welcome email is sent
   - Success page is displayed

## How It Works

1. **User Journey:**
   - User visits landing page → clicks "Purchase License"
   - Fills out license form at `/purchase`
   - Redirected to Stripe Checkout for payment
   - After payment → Success page
   - Receives welcome email with activation instructions

2. **Backend Flow:**
   - `POST /api/checkout/create-session` - Creates Stripe checkout session with license metadata
   - User completes payment on Stripe
   - Stripe sends webhook to `/api/webhooks/stripe`
   - Webhook handler:
     - Generates unique license key
     - Creates license in database
     - Sends welcome email via Resend
   - User can activate via email verification code

3. **Database Updates:**
   - Added `stripe_session_id` - Stripe checkout session ID
   - Added `stripe_payment_intent` - Stripe payment intent ID
   - Added `created_at` - Timestamp for tracking

## Files Created

- `/app/purchase/page.tsx` - Purchase form
- `/app/purchase/success/page.tsx` - Success page
- `/app/api/checkout/create-session/route.ts` - Create Stripe checkout
- `/app/api/webhooks/stripe/route.ts` - Handle successful payments
- `/supabase/migrations/add_stripe_fields.sql` - Database schema update

## Pricing

Current pricing: **$399** (one-time payment)
- Defined in: `/app/api/checkout/create-session/route.ts:23` (39900 cents)
- Displayed in: `/app/page.tsx` and `/app/purchase/page.tsx`

## Volume Discounts

For volume licenses, you can manually create licenses via the admin dashboard at `/admin` with custom pricing arrangements.
