// Simple email service that can work with multiple providers
interface EmailProvider {
  name: string
  send: (options: EmailOptions) => Promise<{ success: boolean; error?: string }>
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Console logger (for development/testing)
const consoleProvider: EmailProvider = {
  name: "Console",
  send: async (options) => {
    console.log("📧 EMAIL WOULD BE SENT:")
    console.log("To:", options.to)
    console.log("Subject:", options.subject)
    console.log("Content:", options.text || options.html.substring(0, 100) + "...")
    return { success: true }
  },
}

// Resend provider
const resendProvider: EmailProvider = {
  name: "Resend",
  send: async (options) => {
    try {
      // Dynamic import to avoid issues if Resend isn't available
      const { Resend } = await import("resend")
      const resend = new Resend(process.env.RESEND_API_KEY)

      const result = await resend.emails.send({
        from: "CTM Parts <onboarding@resend.dev>",
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      })

      if (result.error) {
        return { success: false, error: result.error.message }
      }

      return { success: true }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Resend error",
      }
    }
  },
}

export class SimpleEmailService {
  private getProvider(): EmailProvider {
    // Check if Resend is properly configured
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.startsWith("re_")) {
      console.log("✅ Using Resend email provider")
      return resendProvider
    }

    console.log("⚠️ Using Console email provider (emails will be logged)")
    return consoleProvider
  }

  async sendWelcomeEmail(userEmail: string, userName: string): Promise<{ success: boolean; error?: string }> {
    const provider = this.getProvider()

    const html = `
      <!DOCTYPE html>
      <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">🚗 Welcome to CTM Parts!</h1>
        </div>
        
        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="margin-top: 0;">Hi ${userName}! 👋</h2>
          <p>Welcome to the CTM Parts Community! We're excited to have you join us.</p>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0;">What you can do:</h3>
            <ul>
              <li>🗣️ Join forum discussions</li>
              <li>🚗 Attend car & truck meets</li>
              <li>👥 Create and join groups</li>
              <li>🏆 Earn rewards for participation</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "#"}" 
               style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold;">
              Get Started Now 🚀
            </a>
          </div>
          
          <p style="color: #666; text-align: center;">
            Welcome to the community!<br>
            <strong>The CTM Parts Team</strong>
          </p>
        </div>
      </body>
      </html>
    `

    const text = `Welcome to CTM Parts Community, ${userName}! We're excited to have you join our automotive community.`

    return await provider.send({
      to: userEmail,
      subject: "🚗 Welcome to CTM Parts Community!",
      html,
      text,
    })
  }

  async sendTestEmail(userEmail: string): Promise<{ success: boolean; error?: string }> {
    const provider = this.getProvider()

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #667eea;">✅ Email Test Successful!</h1>
        <p>Your email service is working with <strong>${provider.name}</strong>!</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
        <p style="color: #666;">This is a test email from CTM Parts Community.</p>
      </div>
    `

    return await provider.send({
      to: userEmail,
      subject: `🧪 Email Test - ${provider.name} Provider`,
      html,
      text: `Email test successful using ${provider.name}! Timestamp: ${new Date().toLocaleString()}`,
    })
  }

  getProviderInfo(): { name: string; configured: boolean; details: string } {
    const hasResendKey = !!process.env.RESEND_API_KEY
    const isValidResendKey = process.env.RESEND_API_KEY?.startsWith("re_")

    if (hasResendKey && isValidResendKey) {
      return {
        name: "Resend",
        configured: true,
        details: "Resend API key is properly configured",
      }
    } else if (hasResendKey && !isValidResendKey) {
      return {
        name: "Console",
        configured: false,
        details: "Resend API key exists but appears invalid (should start with 're_')",
      }
    } else {
      return {
        name: "Console",
        configured: false,
        details: "No Resend API key found - using console logging",
      }
    }
  }
}

export const simpleEmailService = new SimpleEmailService()
