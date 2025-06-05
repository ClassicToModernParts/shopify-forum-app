// Enhanced email service with domain verification guidance
interface EmailResult {
  success: boolean
  error?: string
  messageId?: string
  provider?: string
  fallback?: boolean
  resetToken?: string
  needsDomainVerification?: boolean
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
  resetToken?: string
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

      // Use your verified domain for the from address
      const fromAddress = process.env.RESEND_FROM_EMAIL || "noreply@classictomodernparts.com"

      const result = await resend.emails.send({
        from: `CTM Parts <${fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
      })

      if (result.error) {
        console.error("❌ Resend API error:", result.error)

        // Check for specific domain verification error
        if (result.error.message?.includes("You can only send testing emails to your own email address")) {
          return {
            success: false,
            error: `Domain verification required. Please verify your domain at resend.com/domains`,
            provider: "resend",
            needsDomainVerification: true,
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

  private logEmailWithInstructions(options: EmailOptions, reason?: string): EmailResult {
    console.log("📧 EMAIL DELIVERY ISSUE:")
    console.log("Reason:", reason)
    console.log("To:", options.to)
    console.log("Subject:", options.subject)

    if (options.resetToken) {
      console.log("🔑 RESET TOKEN:", options.resetToken)
      console.log(
        "🔗 RESET URL:",
        `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/reset-password?token=${options.resetToken}`,
      )
      console.log("\n⚠️  IMPORTANT: Customer cannot receive this email!")
      console.log("📋 TO FIX EMAIL DELIVERY:")
      console.log("1. Go to https://resend.com/domains")
      console.log("2. Add and verify your domain (classictomodernparts.com)")
      console.log("3. Update DNS records as instructed")
      console.log("4. Set RESEND_FROM_EMAIL=noreply@classictomodernparts.com")
      console.log("5. Redeploy your application")
    }

    return {
      success: false, // Mark as failed since customer won't get email
      messageId: `console-${Date.now()}`,
      provider: "console",
      fallback: true,
      resetToken: options.resetToken,
      needsDomainVerification: true,
      error: "Email not delivered - domain verification required",
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

    // Try Resend
    const resendResult = await this.tryResend(options)

    if (resendResult.success) {
      return resendResult
    }

    // If Resend fails due to domain verification, log with instructions
    if (
      resendResult.error?.includes("domain verification") ||
      resendResult.error?.includes("You can only send testing emails") ||
      resendResult.needsDomainVerification
    ) {
      return this.logEmailWithInstructions(options, resendResult.error)
    }

    // For other errors, still try to help
    console.warn("⚠️ Email delivery failed:", resendResult.error)
    return this.logEmailWithInstructions(options, resendResult.error)
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<EmailResult> {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
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
      resetToken,
    })
  }

  // Other email methods remain the same...
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

  getStatus(): {
    configured: boolean
    provider: string
    details: string
    verifiedEmail?: string
    instructions?: string[]
  } {
    const hasKey = !!process.env.RESEND_API_KEY
    const validKey = process.env.RESEND_API_KEY?.startsWith("re_")

    if (hasKey && validKey) {
      return {
        configured: true,
        provider: "Resend (Needs Domain Verification)",
        details: "Resend API key configured but domain not verified. Customers cannot receive emails.",
        instructions: [
          "1. Go to https://resend.com/domains",
          "2. Add your domain: classictomodernparts.com",
          "3. Add the DNS records provided by Resend",
          "4. Wait for verification (usually 5-10 minutes)",
          "5. Set RESEND_FROM_EMAIL=noreply@classictomodernparts.com",
          "6. Redeploy your application",
        ],
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
