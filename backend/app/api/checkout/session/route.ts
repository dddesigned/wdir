import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-11-17.clover'
})

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const sessionId = searchParams.get('session_id')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Missing session ID' },
        { status: 400 }
      )
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)

    // Extract the metadata
    const { metadata } = session

    if (!metadata) {
      return NextResponse.json(
        { success: false, error: 'Session metadata not found' },
        { status: 404 }
      )
    }

    // Return formatted session data
    return NextResponse.json({
      success: true,
      session: {
        email: metadata.email,
        companyName: metadata.company_name,
        inspectorName: metadata.inspector_name,
        amount: session.amount_total || 0
      }
    })

  } catch (error) {
    console.error('Failed to retrieve session:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve session details' },
      { status: 500 }
    )
  }
}
