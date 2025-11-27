import Link from 'next/link'
import Image from 'next/image'

export default function PurchaseSuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <Image
              src="/WDIR-icon.png"
              alt="WDIR Inspector"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">WDIR Inspector</span>
          </Link>
        </div>
      </header>

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
            Thank you for purchasing WDIR Inspector. Your license is being created.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-left">
            <h2 className="font-semibold text-gray-900 mb-3">What happens next?</h2>
            <ol className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong>Check your email</strong> - You'll receive a welcome email with your license details and activation instructions within a few minutes.
                </div>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mr-3 flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong>Download the app</strong> - Install WDIR Inspector on your iPhone or iPad from the download link in the email.
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
              If you don't receive your welcome email within 10 minutes, please check your spam folder or contact support.
            </p>
            <a
              href="mailto:miciah@dddesigned.com"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              miciah@dddesigned.com
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
    </div>
  )
}
