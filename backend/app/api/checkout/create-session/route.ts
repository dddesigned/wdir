import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover'
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      email,
      company_name,
      company_phone,
      company_license_number,
      inspector_name,
      inspector_license
    } = body

    // Validate required fields
    if (!email || !company_name || !inspector_name || !inspector_license) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the app URL from environment or construct from request
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ||
      `https://${request.headers.get('host')}`

    if (!appUrl || !appUrl.startsWith('http')) {
      console.error('Invalid NEXT_PUBLIC_APP_URL:', appUrl)
      return NextResponse.json(
        { success: false, error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'WDIR Inspector - Professional License',
              description: 'Lifetime access to WDIR Inspector app with all future updates',
              images: [`${appUrl}/WDIR-icon.png`]
            },
            unit_amount: 39900 // $399.00 in cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${appUrl}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/purchase`,
      customer_email: email,
      metadata: {
        email,
        company_name,
        company_phone: company_phone || '',
        company_license_number: company_license_number || '',
        inspector_name,
        inspector_license,
        product_type: 'wdir_license'
      }
    })

    return NextResponse.json({
      success: true,
      url: session.url
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
