import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"

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

// Generate reset token
function generateResetToken(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `reset_${timestamp}_${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, token, newPassword } = body

    if (!email) {
      return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
    }

    // If only email is provided, generate reset token
    if (!token && !newPassword) {
      const user = forumDataStore.getUserByEmail(email)
      if (!user) {
        // Don't reveal if user exists or not for security
        return NextResponse.json({
          success: true,
          message: "If an account with this email exists, you will receive reset instructions.",
        })
      }

      const resetToken = generateResetToken()

      // Store reset token (in a real app, this would be in a database with expiration)
      forumDataStore.setPasswordResetToken(user.id, resetToken)

      // In a real app, you would send an email here
      console.log(`Password reset token for ${email}: ${resetToken}`)

      return NextResponse.json({
        success: true,
        message: "Password reset instructions have been sent to your email.",
        // For demo purposes, return the token (remove this in production)
        resetToken: resetToken,
      })
    }

    // If token and new password are provided, reset the password
    if (token && newPassword) {
      const user = forumDataStore.getUserByResetToken(token)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid or expired reset token",
          },
          { status: 400 },
        )
      }

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

      // Update password
      const hashedPassword = simpleHash(newPassword)
      forumDataStore.updateUserPassword(user.id, hashedPassword)

      // Clear reset token
      forumDataStore.clearPasswordResetToken(user.id)

      return NextResponse.json({
        success: true,
        message: "Password has been reset successfully. You can now log in with your new password.",
      })
    }

    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Password reset error:", error)
    return NextResponse.json({ success: false, message: "Password reset failed" }, { status: 500 })
  }
}
