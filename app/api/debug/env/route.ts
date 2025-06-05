import { NextResponse } from "next/server"

export async function GET() {
  return NextResponse.json({
    hasResendKey: !!process.env.RESEND_API_KEY,
    resendKeyLength: process.env.RESEND_API_KEY?.length || 0,
    resendKeyPrefix: process.env.RESEND_API_KEY?.substring(0, 8) || "none",
    allEnvKeys: Object.keys(process.env).filter((key) => key.includes("RESEND")),
    nodeEnv: process.env.NODE_ENV,
  })
}
