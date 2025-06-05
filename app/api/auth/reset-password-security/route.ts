import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Security Reset API: Starting password reset")

    const { username, answers, newPassword } = await request.json()
    console.log("🔐 Security Reset API: Reset request for:", username)

    if (!username || !answers || !newPassword) {
      console.log("❌ Security Reset API: Missing required fields")
      return NextResponse.json(
        { success: false, message: "Username, security answers, and new password are required" },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      console.log("❌ Security Reset API: Password too short")
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Ensure data store is initialized
    if (!(await persistentForumDataStore.isInitialized())) {
      await persistentForumDataStore.initialize()
    }

    // Get user
    const user = await persistentForumDataStore.getUserWithSecurityQuestions(username)
    if (!user) {
      console.log("❌ Security Reset API: User not found")
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      console.log("❌ Security Reset API: No security questions set")
      return NextResponse.json(
        { success: false, message: "No security questions found for this user" },
        { status: 400 },
      )
    }

    // Verify security answers
    const isValid = await persistentForumDataStore.verifySecurityAnswers(username, answers)
    if (!isValid) {
      console.log("❌ Security Reset API: Invalid security answers")
      return NextResponse.json({ success: false, message: "Security answers are incorrect" }, { status: 401 })
    }

    // Update password
    const hashedPassword = hashPassword(newPassword)
    const updatedUser = await persistentForumDataStore.updateUser(user.id, {
      password: hashedPassword,
    })

    if (!updatedUser) {
      console.log("❌ Security Reset API: Failed to update password")
      return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
    }

    console.log("✅ Security Reset API: Password reset successful for:", username)
    return NextResponse.json({
      success: true,
      message: "Password reset successful! You can now login with your new password.",
    })
  } catch (error) {
    console.error("❌ Security Reset API: Error:", error)
    return NextResponse.json({ success: false, message: "Password reset failed" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get("username")

    if (!username) {
      return NextResponse.json({ success: false, message: "Username is required" }, { status: 400 })
    }

    // Ensure data store is initialized
    if (!(await persistentForumDataStore.isInitialized())) {
      await persistentForumDataStore.initialize()
    }

    const user = await persistentForumDataStore.getUserWithSecurityQuestions(username)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    if (!user.securityQuestions || user.securityQuestions.length === 0) {
      return NextResponse.json({ success: false, message: "No security questions found" }, { status: 400 })
    }

    // Return only the questions, not the answers
    const questions = user.securityQuestions.map((sq) => sq.question)
    return NextResponse.json({
      success: true,
      questions,
    })
  } catch (error) {
    console.error("❌ Security Reset API: Error getting questions:", error)
    return NextResponse.json({ success: false, message: "Failed to get security questions" }, { status: 500 })
  }
}
