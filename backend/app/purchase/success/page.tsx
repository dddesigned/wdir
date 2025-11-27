import { Suspense } from 'react'
import SuccessContent from './SuccessContent'
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
              alt="Texas WDIR by Digital Data Designed"
              width={32}
              height={32}
              className="w-8 h-8"
            />
            <span className="text-xl font-bold text-gray-900">Texas WDIR by Digital Data Designed</span>
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="max-w-2xl mx-auto px-4 py-16">
            <div className="bg-white rounded-lg shadow-lg border p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading...</p>
            </div>
          </div>
        }
      >
        <SuccessContent />
      </Suspense>
    </div>
  )
}
