'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function PurchasePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    company_name: '',
    company_phone: '',
    company_license_number: '',
    inspector_name: '',
    inspector_license: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success && data.url) {
        // Redirect to Stripe checkout
        window.location.href = data.url
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create checkout session' })
        setLoading(false)
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error. Please try again.' })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image
              src="/WDIR-icon.png"
              alt="Texas WDIR by Digital Data Designed"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">Texas WDIR by Digital Data Designed</span>
          </Link>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Purchase License</h1>
          <p className="text-xl text-gray-600">
            Complete the form below to purchase your WDIR Inspector license
          </p>
        </div>

        {/* Pricing Summary */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Professional License</h2>
              <p className="text-sm text-gray-600">One-time payment, per inspector • Lifetime access</p>
            </div>
            <div className="text-3xl font-bold text-blue-600">$399</div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Purchase Form */}
        <div className="bg-white rounded-lg shadow-lg border p-8">
          <h2 className="text-xl font-semibold mb-6">License Information</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="inspector@example.com"
                disabled={loading}
              />
              <p className="text-sm text-gray-500 mt-1">
                Your license activation code will be sent to this email
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Texas Termite Control"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company Phone
              </label>
              <input
                type="tel"
                value={formData.company_phone}
                onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="(555) 123-4567"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Company License Number
              </label>
              <input
                type="text"
                value={formData.company_license_number}
                onChange={(e) => setFormData({ ...formData, company_license_number: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="SPC-TX-12345"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inspector Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.inspector_name}
                onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="John Doe"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Inspector License Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.inspector_license}
                onChange={(e) => setFormData({ ...formData, inspector_license: e.target.value })}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="LIC-12345"
                disabled={loading}
              />
            </div>

            <div className="pt-4 border-t">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-blue-600 text-white text-lg font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment powered by Stripe
              </p>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  )
}
