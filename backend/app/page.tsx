import Link from 'next/link'
import Image from 'next/image'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section with Banner */}
      <section className="relative">
        <div className="w-full">
          <Image
            src="/banner.png"
            alt="WDIR Inspector Banner"
            width={1920}
            height={600}
            className="w-full h-auto"
            priority
          />
        </div>
        {/* Overlay Content on Lower Half of Banner */}
        <div className="absolute inset-0 flex items-end pb-12 md:pb-16">
          <div className="max-w-6xl mx-auto px-4 w-full">
            <div className="flex flex-col items-center bg-black/50 backdrop-blur-sm rounded-2xl px-6 py-8 md:px-12 md:py-12">
              {/* Icon and Title Row */}
              <div className="flex items-center justify-center gap-4 md:gap-6 mb-6">
                <Image
                  src="/WDIR-icon.png"
                  alt="WDIR Inspector Icon"
                  width={120}
                  height={120}
                  className="w-16 h-16 md:w-24 md:h-24 lg:w-32 lg:h-32 flex-shrink-0"
                />
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white drop-shadow-lg text-left">
                  Professional Wood Destroying Insect Reports
                </h1>
              </div>
              <p className="text-lg md:text-xl text-white drop-shadow-lg mb-8 max-w-2xl text-center">
                Create industry-standard WDIR reports on your iOS device.
                Fast, accurate, and compliant with Texas regulations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#purchase"
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition shadow-lg"
                >
                  Get Started
                </a>
                <a
                  href="#features"
                  className="px-8 py-3 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition shadow-lg"
                >
                  Learn More
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Industry-Standard Reports</h3>
            <p className="text-gray-600">
              Generate PDF reports that meet Texas WDIR requirements with proper formatting and all required fields.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Smart Preferences</h3>
            <p className="text-gray-600">
              Auto-fill common fields with your preferences. Save time on every inspection with customizable defaults.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
            <p className="text-gray-600">
              All reports stored locally on your device. No cloud sync means complete privacy for your inspections.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Photo Integration</h3>
            <p className="text-gray-600">
              Capture and attach photos directly from your device. Document findings with visual evidence.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Mobile-First Design</h3>
            <p className="text-gray-600">
              Built for iPhone and iPad. Work seamlessly in the field with an interface optimized for touch.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Simple Licensing</h3>
            <p className="text-gray-600">
              Email-based activation. Use on multiple devices with a single license. No complicated license keys.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="purchase" className="max-w-6xl mx-auto px-4 py-16 scroll-mt-16">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-gray-600 mb-12">
          One-time purchase. No subscriptions. No hidden fees.
        </p>

        <div className="max-w-md mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-lg border-2 border-blue-600">
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold mb-2">Professional License</h3>
              <div className="text-5xl font-bold text-blue-600 mb-2">$399</div>
              <p className="text-gray-600">One-time payment, per inspector</p>
            </div>

            <ul className="space-y-3 mb-8">
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Lifetime access to WDIR Inspector app</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>All future updates included</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Email support</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>No recurring fees or subscriptions</span>
              </li>
              <li className="flex items-start">
                <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Volume license discounts available</span>
              </li>
            </ul>

            <Link
              href="/purchase"
              className="block w-full px-8 py-3 bg-blue-600 text-white text-center rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Purchase License
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="font-semibold mb-2">Purchase License</h3>
              <p className="text-gray-600 text-sm">
                Contact us with your company details and payment
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="font-semibold mb-2">Receive Welcome Email</h3>
              <p className="text-gray-600 text-sm">
                Get your license details and download link
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="font-semibold mb-2">Download & Activate</h3>
              <p className="text-gray-600 text-sm">
                Install the app and activate with your email
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="font-semibold mb-2">Start Inspecting</h3>
              <p className="text-gray-600 text-sm">
                Create professional WDIR reports in minutes
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Frequently Asked Questions</h2>
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Can I use my license on multiple devices?</h3>
            <p className="text-gray-600">
              Yes! Your license can be used on multiple devices. Perfect for using on your iPhone, iPad, and other devices as needed.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Is there a subscription fee?</h3>
            <p className="text-gray-600">
              No! WDIR Inspector is a one-time purchase with lifetime access. Pay once and use it forever,
              including all future updates.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Where are my reports stored?</h3>
            <p className="text-gray-600">
              All reports are stored locally on your device for maximum privacy and security.
              There is no cloud sync, so your inspection data never leaves your device.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">What if I need help?</h3>
            <p className="text-gray-600">
              Every license includes email support. Contact us at{' '}
              <a href="mailto:miciah@dddesigned.com" className="text-blue-600 hover:underline">
                miciah@dddesigned.com
              </a>{' '}
              with any questions or issues.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg border">
            <h3 className="font-semibold text-lg mb-2">Can I transfer my license?</h3>
            <p className="text-gray-600">
              Licenses are tied to your company and email address. If you need to update your license details,
              contact support and we'll help you update your information.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Image
                src="/WDIR-icon.png"
                alt="WDIR Inspector"
                width={32}
                height={32}
                className="w-8 h-8"
              />
              <span className="font-semibold text-gray-900">WDIR Inspector</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-600">
              <a href="mailto:miciah@dddesigned.com" className="hover:text-gray-900">
                Support
              </a>
              <Link href="/admin" className="hover:text-gray-900">
                Admin
              </Link>
            </div>
            <div className="text-sm text-gray-500">
              © 2024 WDIR Inspector. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
