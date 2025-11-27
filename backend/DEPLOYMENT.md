# Vercel Deployment Guide

## Prerequisites

1. GitHub repository with your code
2. Vercel account (free): https://vercel.com
3. Stripe account: https://stripe.com
4. Supabase project running

## Step 1: Prepare for Deployment

### Run Database Migration

Apply the Stripe fields migration to your Supabase database:

```bash
# Navigate to your Supabase project or use Supabase SQL Editor
# Run the SQL from: supabase/migrations/add_stripe_fields.sql
```

Or if using Supabase CLI:
```bash
supabase db push
```

### Verify Environment Variables

Make sure `.env.local` has all required values:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://hnhrwyfeljmwjxruoxze.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Resend
RESEND_API_KEY=re_P9WuUdML_HK4ZvCpwtywSqTcPocZvsHYA
FROM_EMAIL=noreply@texaswdir.com
ADMIN_EMAIL=miciah@dddesigned.com

# Admin Auth
ADMIN_EMAILS=miciah@dddesigned.com

# Stripe (get from https://dashboard.stripe.com/apikeys)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_KEY
STRIPE_SECRET_KEY=sk_live_YOUR_KEY
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET  # Will get this after webhook setup

# App URL (will be your Vercel URL)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Select the `backend` folder as the root directory
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `backend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

5. Add environment variables (click "Environment Variables"):
   - Copy all variables from `.env.local`
   - Add each one (except `STRIPE_WEBHOOK_SECRET` for now)
   - Make sure to select "Production", "Preview", and "Development"

6. Click "Deploy"

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to backend folder
cd /Users/miciah/Documents/GitHub/wdir/backend

# Login to Vercel
vercel login

# Deploy
vercel --prod

# Follow prompts to link to project
```

## Step 3: Configure Stripe Production Webhook

After deployment, you'll have a production URL (e.g., `https://your-app.vercel.app`)

1. **Go to Stripe Dashboard**: https://dashboard.stripe.com/webhooks
2. **Click "Add endpoint"**
3. **Enter webhook URL**: `https://your-app.vercel.app/api/webhooks/stripe`
4. **Select event**: `checkout.session.completed`
5. **Click "Add endpoint"**
6. **Copy the signing secret** (starts with `whsec_`)
7. **Add to Vercel**:
   - Go to your Vercel project → Settings → Environment Variables
   - Add: `STRIPE_WEBHOOK_SECRET` = `whsec_YOUR_SECRET`
   - Redeploy for changes to take effect

## Step 4: Update App URL

In Vercel environment variables, update:
```
NEXT_PUBLIC_APP_URL=https://your-actual-vercel-url.vercel.app
```

Then redeploy (or Vercel will auto-redeploy).

## Step 5: Switch to Production Stripe Keys

**Important**: Before going live with real customers:

1. In Stripe Dashboard, switch from "Test mode" to "Live mode" (toggle in top right)
2. Get your **Live API keys**: https://dashboard.stripe.com/apikeys
3. Update Vercel environment variables:
   ```
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_SECRET_KEY=sk_live_...
   ```
4. Set up **Live webhook** (same as step 3, but in live mode)
5. Redeploy

## Step 6: Test Production Deployment

1. Visit your Vercel URL
2. Click "Purchase License"
3. Fill in details
4. **For Testing**: Use Stripe test mode with test card `4242 4242 4242 4242`
5. **For Production**: Use real payment method
6. Verify:
   - Payment completes
   - License created in database
   - Welcome email sent
   - Success page displays

## Local Development (Optional)

You can still develop locally while having production deployed:

```bash
# Install Stripe CLI
brew install stripe/stripe-brew/stripe

# Login
stripe login

# Forward webhooks to localhost
stripe listen --forward-to http://localhost:3001/api/webhooks/stripe

# Copy the webhook secret to .env.local
STRIPE_WEBHOOK_SECRET=whsec_LOCAL_SECRET

# Run dev server
npm run dev
```

## Custom Domain (Optional)

1. In Vercel project → Settings → Domains
2. Add your custom domain (e.g., `wdir-inspector.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Update Stripe webhook URL to use custom domain

## Troubleshooting

### Webhook not working
- Check Vercel logs: Project → Deployments → Latest → Logs
- Check Stripe webhook logs: Dashboard → Webhooks → Your endpoint
- Verify `STRIPE_WEBHOOK_SECRET` is correct
- Make sure endpoint URL is exactly: `https://your-domain.com/api/webhooks/stripe`

### License not created after payment
- Check Vercel function logs for errors
- Verify Supabase credentials are correct
- Check that migration was applied (stripe_session_id column exists)

### Email not sending
- Verify `RESEND_API_KEY` is correct
- Check that `FROM_EMAIL` domain is verified in Resend
- Check Vercel logs for email errors

## Environment Variables Checklist

Production environment variables needed in Vercel:

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `FROM_EMAIL`
- [ ] `ADMIN_EMAIL`
- [ ] `ADMIN_EMAILS`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `NEXT_PUBLIC_APP_URL`

## Post-Deployment

Once live:
1. Test a real purchase end-to-end
2. Monitor Vercel analytics
3. Monitor Stripe dashboard for payments
4. Check Supabase for license creation
5. Verify emails are being delivered
