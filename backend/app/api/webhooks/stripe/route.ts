import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabaseAdmin } from '@/lib/supabase'
import { generateLicenseKey } from '@/lib/license-utils'
import { sendWelcomeEmail } from '@/lib/email'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover'
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    )
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session

    // Only process WDIR license purchases
    if (session.metadata?.product_type === 'wdir_license') {
      try {
        const {
          email,
          company_name,
          company_phone,
          company_license_number,
          inspector_name,
          inspector_license
        } = session.metadata

        // Generate unique license key
        let license_key = generateLicenseKey()
        let attempts = 0
        const maxAttempts = 10

        while (attempts < maxAttempts) {
          const { data: existing } = await supabaseAdmin
            .from('licenses')
            .select('id')
            .eq('license_key', license_key)
            .single()

          if (!existing) break

          license_key = generateLicenseKey()
          attempts++
        }

        if (attempts >= maxAttempts) {
          console.error('Failed to generate unique license key')
          return NextResponse.json(
            { error: 'Failed to generate license' },
            { status: 500 }
          )
        }

        // Create license in database
        const { data: license, error } = await supabaseAdmin
          .from('licenses')
          .insert({
            license_key,
            email,
            company_name,
            company_phone: company_phone || null,
            company_license_number: company_license_number || null,
            inspector_name,
            inspector_license,
            license_type: 'individual',
            is_active: true,
            stripe_session_id: session.id,
            stripe_payment_intent: session.payment_intent as string
          })
          .select()
          .single()

        if (error) {
          console.error('Failed to create license:', error)
          return NextResponse.json(
            { error: 'Failed to create license' },
            { status: 500 }
          )
        }

        // Send welcome email with license details
        await sendWelcomeEmail(email, company_name, inspector_name)

        console.log('License created successfully:', license_key)
      } catch (error) {
        console.error('Error processing checkout session:', error)
        return NextResponse.json(
          { error: 'Failed to process order' },
          { status: 500 }
        )
      }
    }
  }

  return NextResponse.json({ received: true })
}
