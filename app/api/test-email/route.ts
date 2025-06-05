import { type NextRequest, NextResponse } from "next/server"
import { simpleEmailService } from "@/lib/simple-email-service"

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ success: false, message: "Email address required" }, { status: 400 })
    }

    console.log("🧪 Testing email to:", email)
    const result = await simpleEmailService.sendTestEmail(email)
    const providerInfo = simpleEmailService.getProviderInfo()

    return NextResponse.json({
      success: result.success,
      message: result.success ? "Test email sent successfully!" : "Failed to send email",
      error: result.error,
      provider: providerInfo,
    })
  } catch (error) {
    console.error("❌ Email test error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Server error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  const providerInfo = simpleEmailService.getProviderInfo()

  return NextResponse.json({
    provider: providerInfo,
    environment: {
      hasResendKey: !!process.env.RESEND_API_KEY,
      keyLength: process.env.RESEND_API_KEY?.length || 0,
      keyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || "none",
    },
  })
}
