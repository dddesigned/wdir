export interface License {
  id: string
  license_key: string
  email: string
  company_name: string
  company_phone: string | null
  company_license_number: string | null
  inspector_name: string
  inspector_license: string
  license_type: 'individual' | 'team'
  purchased_at: string
  activated_at: string | null
  expires_at: string | null
  is_active: boolean
  business_id: string | null
  assigned_by: string | null
  assigned_at: string | null
  stripe_customer_id: string | null
  stripe_payment_intent_id: string | null
  last_validated_at: string | null
  device_info: DeviceInfo | null // Legacy field, kept for backward compatibility
  device_count: number
  flagged_multi_device: boolean
  admin_notes: string | null
  created_at: string
  updated_at: string
}

export interface DeviceInfo {
  device_id: string
  device_model: string
  os_version: string
}

export interface Device {
  id: string
  license_id: string
  device_id: string
  device_model: string | null
  os_version: string | null
  first_activated_at: string
  last_used_at: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface VerificationCode {
  id: string
  email: string
  code: string
  expires_at: string
  attempts: number
  verified: boolean
  created_at: string
}

export interface UsageStat {
  id: string
  license_id: string
  period: string // Format: YYYY-MM
  report_count: number
  last_reported_at: string
  created_at: string
  updated_at: string
}

// ============================================================
// EMAIL VERIFICATION API
// ============================================================

export interface RequestVerificationCodeRequest {
  email: string
}

export interface RequestVerificationCodeResponse {
  success: boolean
  message?: string
  error?: string
}

export interface VerifyCodeRequest {
  email: string
  code: string
  device_info?: DeviceInfo
}

export interface VerifyCodeResponse {
  success: boolean
  license?: License
  devices?: Device[]
  error?: string
}

// ============================================================
// USAGE REPORTING API
// ============================================================

export interface ReportUsageRequest {
  email: string
  period: string // Format: YYYY-MM
  report_count: number
}

export interface ReportUsageResponse {
  success: boolean
  message?: string
  error?: string
}

// ============================================================
// LEGACY (keeping for backward compatibility)
// ============================================================

export interface LicenseActivationRequest {
  license_key: string
  device_info?: DeviceInfo
}

export interface LicenseActivationResponse {
  success: boolean
  license?: License
  error?: string
}

export interface LicenseValidationRequest {
  license_key: string
}

export interface LicenseValidationResponse {
  success: boolean
  is_active: boolean
  expires_at: string | null
  error?: string
}
