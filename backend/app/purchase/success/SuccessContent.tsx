'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

interface SessionData {
  email: string
  companyName: string
  inspectorName: string
  amount: number
}

export default function SuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [loading, setLoading] = useState(true)
  const [sessionData, setSessionData] = useState<SessionData | null>(null)

  useEffect(() => {
    if (sessionId) {
      // Fetch session details
      fetch(`/api/checkout/session?session_id=${sessionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setSessionData(data.session)
          }
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [sessionId])

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-lg shadow-lg border p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Processing your purchase...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="bg-white rounded-lg shadow-lg border p-8 text-center">
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Payment Successful!
        </h1>

        <p className="text-lg text-gray-600 mb-8">
          {sessionData?.inspectorName
            ? `Thank you for your purchase, ${sessionData.inspectorName}!`
            : 'Thank you for purchasing WDIR Inspector. Your license is being created.'}
        </p>

        {sessionData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Company:</span>
                <span className="font-medium">{sessionData.companyName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inspector:</span>
                <span className="font-medium">{sessionData.inspectorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{sessionData.email}</span>
              </div>
              <div className="flex justify-between pt-2 border-t">
                <span className="text-gray-600">Amount Paid:</span>
                <span className="font-bold text-gray-900">${(sessionData.amount / 100).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
          <h2 className="font-semibold text-gray-900 mb-3">What happens next?</h2>
          <ol className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0 mt-0.5">
                1
              </span>
              <div>
                <strong>Check your email</strong> - You'll receive a welcome email with your license details and activation instructions within a few minutes{sessionData?.email ? ` at ${sessionData.email}` : ''}.
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0 mt-0.5">
                2
              </span>
              <div>
                <strong>Download the app</strong> - Install WDIR Inspector on your iPhone or iPad from the App Store.
              </div>
            </li>
            <li className="flex items-start">
              <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0 mt-0.5">
                3
              </span>
              <div>
                <strong>Activate your license</strong> - Open the app and enter your email address to receive a verification code and start using WDIR Inspector.
              </div>
            </li>
          </ol>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Need help?</h3>
          <p className="text-gray-600 mb-3">
            If you don't receive your welcome email within 10 minutes, please check your spam folder or contact us.
          </p>
          <a
            href="mailto:miciah@dddesigned.com"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Contact us
          </a>
        </div>

        <Link
          href="/"
          className="inline-block px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Return to Home
        </Link>
      </div>
    </div>
  )
}
