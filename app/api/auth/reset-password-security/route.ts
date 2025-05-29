import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"

// Simple hash function (same as in data store)
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
    const { username, securityAnswer, newPassword, step } = body

    if (step === "getQuestion") {
      // Step 1: Get security question for username
      if (!username) {
        return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
      }

      const user = forumDataStore.getUserByUsername(username)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "No account found with this username",
          },
          { status: 404 },
        )
      }

      if (!user.securityQuestion) {
        return NextResponse.json(
          {
            success: false,
            message: "No security question set up for this account. Please contact support.",
          },
          { status: 400 },
        )
      }

      return NextResponse.json({
        success: true,
        securityQuestion: user.securityQuestion,
      })
    }

    if (step === "resetPassword") {
      // Step 2: Verify answer and reset password
      if (!username || !securityAnswer || !newPassword) {
        return NextResponse.json(
          { success: false, message: "Username, security answer, and new password are required" },
          { status: 400 },
        )
      }

      const user = forumDataStore.getUserByUsername(username)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "No account found with this username",
          },
          { status: 404 },
        )
      }

      // Verify security answer
      const isAnswerCorrect = forumDataStore.verifySecurityAnswer(user.id, securityAnswer)
      if (!isAnswerCorrect) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect security answer. Please try again.",
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
      const success = forumDataStore.updateUserPassword(user.id, hashedPassword)

      if (success) {
        return NextResponse.json({
          success: true,
          message: "Password has been reset successfully. You can now log in with your new password.",
        })
      } else {
        return NextResponse.json(
          {
            success: false,
            message: "Failed to update password. Please try again.",
          },
          { status: 500 },
        )
      }
    }

    return NextResponse.json({ success: false, message: "Invalid request" }, { status: 400 })
  } catch (error) {
    console.error("Security question password reset error:", error)
    return NextResponse.json({ success: false, message: "Password reset failed" }, { status: 500 })
  }
}
