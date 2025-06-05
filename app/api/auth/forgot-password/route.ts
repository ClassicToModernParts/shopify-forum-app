import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { emailService } from "@/lib/email-service"
import * as crypto from "crypto"

function generateResetToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔑 Forgot Password API: Starting password reset process")

    const { email } = await request.json()
    console.log("🔑 Forgot Password API: Request for:", email)

    if (!email) {
      console.log("❌ Forgot Password API: Missing email")
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Forgot Password API: Invalid email format")
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Ensure data store is initialized
    console.log("🔄 Forgot Password API: Checking initialization")
    if (!(await persistentForumDataStore.isInitialized())) {
      console.log("🔄 Forgot Password API: Initializing data store")
      await persistentForumDataStore.initialize()
    }

    // Find user by email
    console.log("🔍 Forgot Password API: Looking up user by email")
    const user = await persistentForumDataStore.getUserByEmail(email)

    // For security, don't reveal if email exists or not
    if (!user) {
      console.log("ℹ️ Forgot Password API: Email not found, but returning success for security")
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive password reset instructions",
      })
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("ℹ️ Forgot Password API: User account inactive, but returning success for security")
      return NextResponse.json({
        success: true,
        message: "If your email is registered, you will receive password reset instructions",
      })
    }

    // Generate reset token
    console.log("🎫 Forgot Password API: Generating reset token")
    const resetToken = generateResetToken()
    const tokenExpiry = new Date()
    tokenExpiry.setHours(tokenExpiry.getHours() + 1) // Token valid for 1 hour

    // Store reset token
    console.log("💾 Forgot Password API: Storing reset token")
    const tokenStored = await persistentForumDataStore.storePasswordResetToken(
      user.id,
      resetToken,
      tokenExpiry.toISOString(),
    )

    if (!tokenStored) {
      console.error("❌ Forgot Password API: Failed to store reset token")
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process password reset request",
        },
        { status: 500 },
      )
    }

    // Send password reset email
    console.log("📧 Forgot Password API: Sending password reset email")
    const emailResult = await emailService.sendPasswordResetEmail(user.email, user.name, resetToken)

    if (emailResult.success) {
      console.log("✅ Forgot Password API: Password reset email sent successfully")
    } else {
      console.error("❌ Forgot Password API: Failed to send password reset email:", emailResult.error)
      // Still return success to user for security reasons
    }

    return NextResponse.json({
      success: true,
      message: "If your email is registered, you will receive password reset instructions",
    })
  } catch (error) {
    console.error("❌ Forgot Password API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Password reset request failed due to server error",
      },
      { status: 500 },
    )
  }
}
