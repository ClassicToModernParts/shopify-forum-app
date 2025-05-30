import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

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

      const user = await persistentForumDataStore.getUserByUsername(username)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "No account found with this username",
          },
          { status: 404 },
        )
      }

      // For now, return a default security question since we don't have security questions set up yet
      const defaultQuestion = "What is your favorite color?"

      return NextResponse.json({
        success: true,
        securityQuestion: defaultQuestion,
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

      const user = await persistentForumDataStore.getUserByUsername(username)
      if (!user) {
        return NextResponse.json(
          {
            success: false,
            message: "No account found with this username",
          },
          { status: 404 },
        )
      }

      // For demo purposes, accept "blue" as the correct answer
      // In production, you'd store and verify actual security answers
      const isAnswerCorrect = securityAnswer.toLowerCase().trim() === "blue"
      if (!isAnswerCorrect) {
        return NextResponse.json(
          {
            success: false,
            message: "Incorrect security answer. Please try again. (Hint: it's a primary color)",
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

      // Update password using the persistent store
      const hashedPassword = simpleHash(newPassword)
      const success = await persistentForumDataStore.updateUserPassword(user.id, hashedPassword)

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
