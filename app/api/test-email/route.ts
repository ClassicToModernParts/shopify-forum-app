import { type NextRequest, NextResponse } from "next/server"
import { emailService } from "@/lib/email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email address required" }, { status: 400 })
    }

    console.log("🧪 Testing email service for:", email)

    const result = await emailService.sendTestEmail(email)
    const status = emailService.getStatus()

    return NextResponse.json({
      success: result.success,
      message: result.success
        ? `Test email sent successfully via ${result.provider}!`
        : `Failed to send email: ${result.error}`,
      error: result.error,
      provider: result.provider,
      messageId: result.messageId,
      emailStatus: status,
    })
  } catch (error) {
    console.error("❌ Email test API error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error during email test",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const status = emailService.getStatus()

  return NextResponse.json({
    emailStatus: status,
    environment: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      keyLength: process.env.RESEND_API_KEY?.length || 0,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || "none",
      keyValid: process.env.RESEND_API_KEY?.startsWith("re_") || false,
    },
  })
}
