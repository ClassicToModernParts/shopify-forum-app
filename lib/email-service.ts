import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

interface EmailOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
}

export class EmailService {
  // Use a verified domain or Resend's onboarding domain
  private defaultFrom = "CTM Parts <onboarding@resend.dev>"

  async sendEmail(options: EmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      if (!process.env.RESEND_API_KEY) {
        console.warn("⚠️ RESEND_API_KEY not found")
        return { success: false, error: "Email service not configured" }
      }

      console.log("📧 Sending email to:", options.to)

      const result = await resend.emails.send({
        from: options.from || this.defaultFrom,
        to: Array.isArray(options.to) ? options.to : [options.to],
        subject: options.subject,
        html: options.html || options.text,
        text: options.text,
      })

      if (result.error) {
        console.error("❌ Resend error:", result.error)
        return { success: false, error: result.error.message }
      }

      console.log("✅ Email sent successfully:", result.data?.id)
      return { success: true, messageId: result.data?.id }
    } catch (error) {
      console.error("❌ Email send failed:", error)
      return { success: false, error: error instanceof Error ? error.message : "Unknown error" }
    }
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to CTM Parts Community</title>
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
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}" 
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

    const textVersion = `
Welcome to CTM Parts Community, ${userName}!

We're excited to have you join our automotive community.

What you can do:
• Join forum discussions
• Attend car and truck meets  
• Create and join groups
• Earn rewards for participation

Get started: ${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}

Questions? Just reply to this email!
- The CTM Parts Team
    `

    await this.sendEmail({
      to: userEmail,
      subject: "🚗 Welcome to CTM Parts Community!",
      html,
      text: textVersion,
    })
  }

  async sendPasswordResetEmail(userEmail: string, userName: string, resetToken: string): Promise<void> {
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://your-app.vercel.app"}/reset-password?token=${resetToken}`

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: #dc3545; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🔐 Password Reset</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="margin-top: 0;">Hi ${userName},</h2>
          <p>You requested a password reset for your CTM Parts Community account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Reset My Password
            </a>
          </div>
          
          <p style="font-size: 14px; color: #666;">
            Or copy this link: <a href="${resetUrl}">${resetUrl}</a><br>
            This link expires in 1 hour.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      </body>
      </html>
    `

    await this.sendEmail({
      to: userEmail,
      subject: "🔐 Reset Your Password - CTM Parts",
      html,
      text: `Reset your password: ${resetUrl}`,
    })
  }

  // Test email function
  async sendTestEmail(toEmail: string): Promise<{ success: boolean; error?: string }> {
    return await this.sendEmail({
      to: toEmail,
      subject: "🧪 CTM Parts - Email Test",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #667eea;">✅ Email Test Successful!</h1>
          <p>If you're reading this, your email service is working perfectly!</p>
          <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
          <p style="color: #666; font-size: 14px;">This is a test email from CTM Parts Community.</p>
        </div>
      `,
      text: `Email test successful! Timestamp: ${new Date().toLocaleString()}`,
    })
  }
}

export const emailService = new EmailService()
