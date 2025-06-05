// Robust email service with better error handling
interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
  provider?: string
  fallback?: boolean
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

class EmailService {
  private async tryResend(options: EmailOptions): Promise<EmailResult> {
    try {
      // Check if Resend is properly configured
      if (!process.env.RESEND_API_KEY) {
        return { success: false, error: "RESEND_API_KEY not configured", provider: "none" }
      }

      if (!process.env.RESEND_API_KEY.startsWith("re_")) {
        return { success: false, error: "Invalid Resend API key format", provider: "resend" }
      }

      // Dynamic import to avoid build issues
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)

      console.log("📧 Attempting to send email via Resend to:", options.to)

      const result = await resend.emails.send({
        from: "CTM Parts <onboarding@resend.dev>",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""), // Strip HTML for text
      })

      if (result.error) {
        console.error("❌ Resend API error:", result.error)

        // Check for specific domain verification error
        if (result.error.message?.includes("You can only send testing emails to your own email address")) {
          return {
            success: false,
            error: `Resend domain not verified. Can only send to verified addresses.`,
            provider: "resend",
          }
        }

        return {
          success: false,
          error: `Resend error: ${result.error.message}`,
          provider: "resend",
        }
      }

      console.log("✅ Email sent successfully via Resend:", result.data?.id)
      return {
        success: true,
        messageId: result.data?.id,
        provider: "resend",
      }
    } catch (error) {
      console.error("❌ Resend service error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown Resend error",
        provider: "resend",
      }
    }
  }

  private logEmail(options: EmailOptions, reason?: string): EmailResult {
    console.log("📧 EMAIL LOG (Console Mode):")
    if (reason) {
      console.log("Reason:", reason)
    }
    console.log("To:", options.to)
    console.log("Subject:", options.subject)
    console.log("Content Preview:", options.text?.substring(0, 100) || options.html.substring(0, 100))
    console.log("Full HTML:", options.html)

    return {
      success: true,
      messageId: `console-${Date.now()}`,
      provider: "console",
      fallback: !!reason,
    }
  }

  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    // Validate input
    if (!options.to || !options.subject || !options.html) {
      return { success: false, error: "Missing required email fields" }
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(options.to)) {
      return { success: false, error: "Invalid email address format" }
    }

    // Check if this is the verified email address for Resend
    const verifiedEmail = "info@classictomodernparts.com"
    const isVerifiedEmail = options.to.toLowerCase() === verifiedEmail.toLowerCase()

    // Try Resend first, but only if it's the verified email or we want to test the error
    const resendResult = await this.tryResend(options)

    if (resendResult.success) {
      return resendResult
    }

    // Check if it's a domain verification issue
    if (
      resendResult.error?.includes("domain not verified") ||
      resendResult.error?.includes("You can only send testing emails")
    ) {
      if (isVerifiedEmail) {
        console.warn("⚠️ Even verified email failed, falling back to console")
      } else {
        console.warn(
          `⚠️ Resend domain not verified. To send real emails, verify domain at resend.com/domains or use ${verifiedEmail}`,
        )
      }

      return this.logEmail(options, `Resend domain not verified - ${resendResult.error}`)
    }

    // Fall back to console logging for other errors
    console.warn("⚠️ Resend failed, falling back to console logging:", resendResult.error)
    return this.logEmail(options, resendResult.error)
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<EmailResult> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to CTM Parts</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 28px;">🚗 Welcome to CTM Parts!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName}! 👋</h2>
          
          <p>Welcome to the CTM Parts Community! We're thrilled to have you join our community of automotive enthusiasts.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea;">
            <h3 style="margin-top: 0; color: #667eea;">What you can do:</h3>
            <ul style="padding-left: 20px;">
              <li>🗣️ <strong>Join Forum Discussions</strong> - Share knowledge and ask questions</li>
              <li>🚗 <strong>Attend Car & Truck Meets</strong> - Connect with local enthusiasts</li>
              <li>👥 <strong>Create & Join Groups</strong> - Find your automotive tribe</li>
              <li>🏆 <strong>Earn Rewards</strong> - Get points for participation</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🚀 Get Started Now
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Questions? Just reply to this email - we're here to help!<br>
            <strong>The CTM Parts Team</strong>
          </p>
        </div>
      </body>
      </html>
    `

    const text = `
Welcome to CTM Parts Community, ${userName}!

We're excited to have you join our automotive community.

What you can do:
• Join forum discussions
• Attend car and truck meets  
• Create and join groups
• Earn rewards for participation

Get started: ${process.env.NEXT_PUBLIC_APP_URL || "your-app-url"}

Questions? Just reply to this email!
- The CTM Parts Team
    `

    return await this.sendEmail({
      to: userEmail,
      subject: "🚗 Welcome to CTM Parts Community!",
      html,
      text,
    })
  }

  async sendLoginNotificationEmail(userEmail: string, userName: string, device: string): Promise<EmailResult> {
    const timestamp = new Date().toLocaleString()
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "#"

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>New Login - CTM Parts</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #4CAF50; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">✅ New Login to Your Account</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          
          <p>We detected a new login to your CTM Parts account.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #4CAF50;">
            <h3 style="margin-top: 0; color: #4CAF50;">Login Details:</h3>
            <p><strong>Time:</strong> ${timestamp}</p>
            <p><strong>Device:</strong> ${device}</p>
          </div>
          
          <p>If this was you, no action is needed. If you didn't log in recently, please secure your account immediately.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${appUrl}/settings/security" 
               style="background: #FF5722; color: white; padding: 12px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              🔒 Secure My Account
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Need help? Contact our support team.<br>
            <strong>The CTM Parts Team</strong>
          </p>
        </div>
      </body>
      </html>
    `

    const text = `
New Login to Your CTM Parts Account

Hi ${userName},

We detected a new login to your CTM Parts account.

Login Details:
• Time: ${timestamp}
• Device: ${device}

If this was you, no action is needed. If you didn't log in recently, please secure your account immediately.

Secure your account: ${appUrl}/settings/security

Need help? Contact our support team.
- The CTM Parts Team
    `

    return await this.sendEmail({
      to: userEmail,
      subject: "✅ New Login to Your CTM Parts Account",
      html,
      text,
    })
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<EmailResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "#"
    const resetUrl = `${appUrl}/reset-password?token=${resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Password Reset - CTM Parts</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #FF5722; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0; font-size: 24px;">🔐 Password Reset Request</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #333; margin-top: 0;">Hi ${userName},</h2>
          
          <p>We received a request to reset your password for your CTM Parts account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #FF5722; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Or copy this link: <a href="${resetUrl}">${resetUrl}</a><br>
            This link expires in 1 hour.
          </p>
          
          <div style="background: #FFF3E0; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #FF5722;">
            <p style="margin: 0; color: #E64A19;"><strong>Important:</strong> If you didn't request this password reset, please ignore this email or contact support if you have concerns.</p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center; margin-top: 30px;">
            Need help? Contact our support team.<br>
            <strong>The CTM Parts Team</strong>
          </p>
        </div>
      </body>
      </html>
    `

    const text = `
Password Reset Request - CTM Parts

Hi ${userName},

We received a request to reset your password for your CTM Parts account.

Reset your password: ${resetUrl}

This link expires in 1 hour.

Important: If you didn't request this password reset, please ignore this email or contact support if you have concerns.

Need help? Contact our support team.
- The CTM Parts Team
    `

    return await this.sendEmail({
      to: userEmail,
      subject: "🔐 Reset Your Password - CTM Parts",
      html,
      text,
    })
  }

  async sendTestEmail(userEmail: string): Promise<EmailResult> {
    const timestamp = new Date().toLocaleString()
    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <div style="background: #667eea; color: white; padding: 20px; border-radius: 10px 10px 0 0; text-align: center;">
          <h1 style="margin: 0;">✅ Email Test Successful!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p>If you're reading this, your email service is working perfectly!</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Timestamp:</strong> ${timestamp}</p>
            <p style="margin: 5px 0 0 0;"><strong>Sent to:</strong> ${userEmail}</p>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            This is a test email from CTM Parts Community.
          </p>
        </div>
      </body>
      </html>
    `

    const text = `Email test successful! Timestamp: ${timestamp}. Sent to: ${userEmail}`

    return await this.sendEmail({
      to: userEmail,
      subject: "🧪 CTM Parts - Email Test Success",
      html,
      text,
    })
  }

  getStatus(): { configured: boolean; provider: string; details: string; verifiedEmail?: string } {
    const hasKey = !!process.env.RESEND_API_KEY
    const validKey = process.env.RESEND_API_KEY?.startsWith("re_")

    if (hasKey && validKey) {
      return {
        configured: true,
        provider: "Resend (Limited)",
        details: "Resend API key configured but domain not verified. Can only send to info@classictomodernparts.com",
        verifiedEmail: "info@classictomodernparts.com",
      }
    } else if (hasKey && !validKey) {
      return {
        configured: false,
        provider: "Console (Invalid Key)",
        details: "Resend API key exists but is invalid (should start with 're_')",
      }
    } else {
      return {
        configured: false,
        provider: "Console (No Key)",
        details: "No Resend API key found - using console logging",
      }
    }
  }
}

export const emailService = new EmailService()
