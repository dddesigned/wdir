'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { License, Device } from '@/types/license'

interface UsageStat {
  id: string
  license_id: string
  period: string
  report_count: number
}

interface LicenseWithDetails extends License {
  devices?: Device[]
  usage?: UsageStat[]
}

export default function AdminDashboardClient() {
  const router = useRouter()
  const [licenses, setLicenses] = useState<LicenseWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [expandedLicense, setExpandedLicense] = useState<string | null>(null)
  const [deviceData, setDeviceData] = useState<Record<string, Device[]>>({})
  const [usageData, setUsageData] = useState<Record<string, UsageStat[]>>({})

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

      if (response.status === 401) {
        router.push('/admin/login')
        return
      }

      if (data.success) {
        setLicenses(data.licenses)
      }
    } catch (error) {
      console.error('Failed to fetch licenses:', error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch devices for a license
  const fetchDevices = async (licenseId: string) => {
    if (deviceData[licenseId]) return // Already fetched

    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/devices`)
      const data = await response.json()

      if (data.success) {
        setDeviceData(prev => ({ ...prev, [licenseId]: data.devices }))
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error)
    }
  }

  // Fetch usage for a license
  const fetchUsage = async (licenseId: string) => {
    if (usageData[licenseId]) return // Already fetched

    try {
      const response = await fetch(`/api/admin/licenses/${licenseId}/usage`)
      const data = await response.json()

      if (data.success) {
        setUsageData(prev => ({ ...prev, [licenseId]: data.usage }))
      }
    } catch (error) {
      console.error('Failed to fetch usage:', error)
    }
  }

  useEffect(() => {
    fetchLicenses()
  }, [])

  // Handle logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' })
      router.push('/admin/login')
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

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

  // Toggle license details
  const toggleLicenseDetails = async (licenseId: string) => {
    if (expandedLicense === licenseId) {
      setExpandedLicense(null)
    } else {
      setExpandedLicense(licenseId)
      // Fetch devices and usage when expanding
      await Promise.all([
        fetchDevices(licenseId),
        fetchUsage(licenseId)
      ])
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">WDIR License Management</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded hover:border-gray-400"
          >
            Logout
          </button>
        </div>

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
            <div className="divide-y">
              {licenses.map((license) => (
                <div key={license.id} className="hover:bg-gray-50">
                  {/* License Row */}
                  <div
                    className="p-6 cursor-pointer"
                    onClick={() => toggleLicenseDetails(license.id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">License Key</div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              copyToClipboard(license.license_key)
                            }}
                            className="font-mono text-sm text-blue-600 hover:text-blue-800"
                            title="Click to copy"
                          >
                            {license.license_key}
                          </button>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Company</div>
                          <div className="text-sm font-medium">{license.company_name}</div>
                          <div className="text-sm text-gray-600">{license.inspector_name}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Email</div>
                          <div className="text-sm">{license.email}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Status</div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 text-xs rounded ${license.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {license.is_active ? 'Active' : 'Inactive'}
                            </span>
                            {license.flagged_multi_device && (
                              <span className="px-2 py-1 text-xs rounded bg-yellow-100 text-yellow-800">
                                Multi-Device
                              </span>
                            )}
                            {license.activated_at && (
                              <span className="text-xs text-green-600">Activated</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="ml-4">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${expandedLicense === license.id ? 'rotate-180' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {expandedLicense === license.id && (
                    <div className="px-6 pb-6 border-t bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        {/* Devices */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3">
                            Devices ({license.device_count || 0})
                          </h3>
                          {deviceData[license.id]?.length > 0 ? (
                            <div className="space-y-2">
                              {deviceData[license.id].map((device) => (
                                <div key={device.id} className="bg-white p-3 rounded border text-sm">
                                  <div className="font-medium">{device.device_model || 'Unknown Model'}</div>
                                  <div className="text-xs text-gray-500 mt-1">
                                    {device.os_version && <div>OS: {device.os_version}</div>}
                                    <div>First: {new Date(device.first_activated_at).toLocaleDateString()}</div>
                                    <div>Last: {new Date(device.last_used_at).toLocaleDateString()}</div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">No devices registered</div>
                          )}
                        </div>

                        {/* Usage Stats */}
                        <div>
                          <h3 className="text-sm font-semibold mb-3">Usage (Last 12 Months)</h3>
                          {usageData[license.id]?.length > 0 ? (
                            <div className="bg-white p-3 rounded border">
                              <div className="space-y-1 text-sm">
                                {usageData[license.id].map((stat) => (
                                  <div key={stat.id} className="flex justify-between">
                                    <span className="text-gray-600">{stat.period}</span>
                                    <span className="font-medium">{stat.report_count} reports</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500">No usage data</div>
                          )}
                        </div>
                      </div>

                      {/* Admin Notes */}
                      {license.admin_notes && (
                        <div className="mt-4">
                          <h3 className="text-sm font-semibold mb-2">Admin Notes</h3>
                          <div className="bg-yellow-50 p-3 rounded border border-yellow-200 text-sm">
                            {license.admin_notes}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
