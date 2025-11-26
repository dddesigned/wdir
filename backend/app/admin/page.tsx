'use client'

import { useState, useEffect } from 'react'
import type { License } from '@/types/license'

export default function AdminDashboard() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const [formData, setFormData] = useState({
    email: '',
    company_name: '',
    company_phone: '',
    company_license_number: '',
    inspector_name: '',
    inspector_license: '',
    license_type: 'individual' as 'individual' | 'team'
  })

  // Fetch licenses
  const fetchLicenses = async () => {
    try {
      const response = await fetch('/api/admin/licenses')
      const data = await response.json()
      if (data.success) {
        setLicenses(data.licenses)
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLicenses()
  }, [])

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setMessage(null)

    try {
      const response = await fetch('/api/admin/licenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage({ type: 'success', text: `License created: ${data.license.license_key}` })
        setFormData({
          email: '',
          company_name: '',
          company_phone: '',
          company_license_number: '',
          inspector_name: '',
          inspector_license: '',
          license_type: 'individual'
        })
        fetchLicenses()
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to create license' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Network error' })
    } finally {
      setCreating(false)
    }
  }

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setMessage({ type: 'success', text: 'Copied to clipboard!' })
    setTimeout(() => setMessage(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">WDIR License Management</h1>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {message.text}
          </div>
        )}

        {/* Create License Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New License</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="inspector@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company Name *</label>
                <input
                  type="text"
                  required
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Texas Termite Control"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company Phone</label>
                <input
                  type="tel"
                  value={formData.company_phone}
                  onChange={(e) => setFormData({ ...formData, company_phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Company License Number</label>
                <input
                  type="text"
                  value={formData.company_license_number}
                  onChange={(e) => setFormData({ ...formData, company_license_number: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="SPC-TX-12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Inspector Name *</label>
                <input
                  type="text"
                  required
                  value={formData.inspector_name}
                  onChange={(e) => setFormData({ ...formData, inspector_name: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Inspector License *</label>
                <input
                  type="text"
                  required
                  value={formData.inspector_license}
                  onChange={(e) => setFormData({ ...formData, inspector_license: e.target.value })}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="LIC-12345"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              {creating ? 'Creating...' : 'Create License'}
            </button>
          </form>
        </div>

        {/* Licenses List */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold">All Licenses ({licenses.length})</h2>
          </div>

          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : licenses.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No licenses yet. Create one above!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Key</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inspector</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Activated</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {licenses.map((license) => (
                    <tr key={license.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => copyToClipboard(license.license_key)}
                          className="font-mono text-sm text-blue-600 hover:text-blue-800"
                          title="Click to copy"
                        >
                          {license.license_key}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-sm">{license.company_name}</td>
                      <td className="px-6 py-4 text-sm">{license.inspector_name}</td>
                      <td className="px-6 py-4 text-sm">{license.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs rounded ${license.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {license.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {license.activated_at ? (
                          <span className="text-green-600">Yes</span>
                        ) : (
                          <span className="text-gray-400">Not yet</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
