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
  device_info: DeviceInfo | null
  created_at: string
  updated_at: string
}

export interface DeviceInfo {
  device_id: string
  device_model: string
  os_version: string
}

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
