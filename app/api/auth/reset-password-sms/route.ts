import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"
import { smsService } from "@/lib/sms-service"

// Simple hash function (same as in auth-service)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone, code, newPassword, action } = body

    if (!phone) {
      return NextResponse.json({ success: false, message: "Phone number is required" }, { status: 400 })
    }

    // Step 1: Send verification code
    if (action === "send_code") {
      const user = forumDataStore.getUserByPhone(phone)
      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({
          success: true,
          message: "If an account with this phone number exists, you will receive a verification code.",
        })
      }

      const verificationCode = smsService.generateVerificationCode()
      const message = `Your password reset code is: ${verificationCode}. This code expires in 10 minutes.`

      const smsResult = await smsService.sendSMS(phone, message)

      if (smsResult.success) {
        // Store verification code
        forumDataStore.setSMSVerificationCode(user.id, verificationCode, phone)

        return NextResponse.json({
          success: true,
          message: "Verification code sent to your phone.",
          // For demo purposes, include the code (remove in production)
          demoCode: verificationCode,
        })
      } else {
        return NextResponse.json({ success: false, message: "Failed to send verification code" }, { status: 500 })
      }
    }

    // Step 2: Verify code and reset password
    if (action === "verify_and_reset" && code && newPassword) {
      // Validate new password
      if (newPassword.length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password must be at least 6 characters long",
          },
          { status: 400 },
        )
      }

      // Verify SMS code
      const user = forumDataStore.verifySMSCode(code, phone)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired verification code",
          },
          { status: 400 },
        )
      }

      // Update password
      const hashedPassword = simpleHash(newPassword)
      const updated = forumDataStore.updateUserPassword(user.id, hashedPassword)

      if (updated) {
        return NextResponse.json({
          success: true,
          message: "Password has been reset successfully. You can now log in with your new password.",
        })
      } else {
        return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
      }
    }

    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("SMS password reset error:", error)
    return NextResponse.json({ success: false, message: "Password reset failed" }, { status: 500 })
  }
}
