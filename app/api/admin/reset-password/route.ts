import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Admin Reset Password API: Starting")

    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ success: false, message: "User ID and new password are required" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Ensure data store is initialized
    if (!(await persistentForumDataStore.isInitialized())) {
      await persistentForumDataStore.initialize()
    }

    // Get user
    const user = await persistentForumDataStore.getUserById(userId)
    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    // Hash new password
    const hashedPassword = hashPassword(newPassword)

    // Update user password
    const updatedUser = await persistentForumDataStore.updateUser(userId, {
      password: hashedPassword,
    })

    if (!updatedUser) {
      return NextResponse.json({ success: false, message: "Failed to update password" }, { status: 500 })
    }

    console.log("✅ Admin Reset Password: Password reset for user:", user.username)

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      username: user.username,
    })
  } catch (error) {
    console.error("❌ Admin Reset Password API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Password reset failed due to server error",
      },
      { status: 500 },
    )
  }
}
