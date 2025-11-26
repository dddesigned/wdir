import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@yourdomain.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@yourdomain.com'

/**
 * Send verification code email
 */
export async function sendVerificationCode(email: string, code: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Your WDIR Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">WDIR Verification Code</h2>
          <p>Your verification code is:</p>
          <div style="background: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #666;">This code will expire in 10 minutes.</p>
          <p style="color: #666; font-size: 14px;">If you didn't request this code, please ignore this email.</p>
        </div>
      `
    })

    if (error) {
      console.error('Failed to send verification email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

/**
 * Send welcome email when license is created
 */
export async function sendWelcomeEmail(
  email: string,
  companyName: string,
  inspectorName: string
) {
  try {
    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Welcome to WDIR - Your License is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Welcome to WDIR!</h2>
          <p>Hi ${inspectorName},</p>
          <p>Your WDIR license for <strong>${companyName}</strong> has been activated.</p>

          <h3>Getting Started:</h3>
          <ol>
            <li>Download the WDIR app from the App Store</li>
            <li>Open the app and enter your email address: <strong>${email}</strong></li>
            <li>You'll receive a verification code via email</li>
            <li>Enter the code to activate your license</li>
            <li>Start creating professional WDIR inspection reports!</li>
          </ol>

          <p>Your license details have been saved and will be applied to all your reports.</p>

          <p style="color: #666; font-size: 14px; margin-top: 30px;">
            If you have any questions, please contact support.
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Failed to send welcome email:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Welcome email send error:', error)
    return { success: false, error }
  }
}

/**
 * Send admin alert for multi-device usage
 */
export async function sendMultiDeviceAlert(
  licenseKey: string,
  email: string,
  companyName: string,
  deviceCount: number,
  devices: Array<{ device_model: string | null; last_used_at: string }>
) {
  try {
    const deviceList = devices
      .map((d, i) => `${i + 1}. ${d.device_model || 'Unknown'} (Last used: ${new Date(d.last_used_at).toLocaleDateString()})`)
      .join('\n')

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: ADMIN_EMAIL,
      subject: `⚠️ Multi-Device Alert: ${companyName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #d9534f;">⚠️ Multi-Device Usage Alert</h2>
          <p>A license has been flagged for usage on 3 or more devices in the last 12 months.</p>

          <h3>License Details:</h3>
          <ul>
            <li><strong>License Key:</strong> ${licenseKey}</li>
            <li><strong>Email:</strong> ${email}</li>
            <li><strong>Company:</strong> ${companyName}</li>
            <li><strong>Device Count:</strong> ${deviceCount}</li>
          </ul>

          <h3>Devices:</h3>
          <pre style="background: #f4f4f4; padding: 15px; border-radius: 4px;">${deviceList}</pre>

          <p style="margin-top: 20px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px;">View in Admin Dashboard</a>
          </p>
        </div>
      `
    })

    if (error) {
      console.error('Failed to send multi-device alert:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Multi-device alert send error:', error)
    return { success: false, error }
  }
}
