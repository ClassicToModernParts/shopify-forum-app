import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Reset Password API: Starting password reset")

    const { token, password } = await request.json()
    console.log("🔐 Reset Password API: Processing reset token")

    if (!token || !password) {
      console.log("❌ Reset Password API: Missing token or password")
      return NextResponse.json({ success: false, message: "Token and password are required" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Reset Password API: Password too short")
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Ensure data store is initialized
    console.log("🔄 Reset Password API: Checking initialization")
    if (!(await persistentForumDataStore.isInitialized())) {
      console.log("🔄 Reset Password API: Initializing data store")
      await persistentForumDataStore.initialize()
    }

    // Verify token
    console.log("🔍 Reset Password API: Verifying token")
    const tokenData = await persistentForumDataStore.verifyPasswordResetToken(token)

    if (!tokenData || !tokenData.userId) {
      console.log("❌ Reset Password API: Invalid or expired token")
      return NextResponse.json({ success: false, message: "Invalid or expired reset token" }, { status: 400 })
    }

    // Get user
    console.log("🔍 Reset Password API: Getting user")
    const user = await persistentForumDataStore.getUserById(tokenData.userId)

    if (!user) {
      console.log("❌ Reset Password API: User not found")
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Update password
    console.log("🔐 Reset Password API: Updating password")
    const hashedPassword = hashPassword(password)
    await persistentForumDataStore.updateUser(user.id, { password: hashedPassword })

    // Invalidate token
    console.log("🚫 Reset Password API: Invalidating token")
    await persistentForumDataStore.invalidatePasswordResetToken(token)

    console.log("✅ Reset Password API: Password reset successful")
    return NextResponse.json({
      success: true,
      message: "Password has been reset successfully",
    })
  } catch (error) {
    console.error("❌ Reset Password API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Password reset failed due to server error",
      },
      { status: 500 },
    )
  }
}
