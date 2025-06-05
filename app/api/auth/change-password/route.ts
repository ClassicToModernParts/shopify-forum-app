import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function verifyPassword(password: string, hashedPassword: string): boolean {
  return hashPassword(password) === hashedPassword
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Change Password API: Starting password change")

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 },
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "New password must be at least 6 characters" },
        { status: 400 },
      )
    }

    // Get user from token
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Ensure data store is initialized
    if (!(await dataStore.isInitialized())) {
      await dataStore.initialize()
    }

    // Get user by token
    const user = await dataStore.getUserByToken(token)
    if (!user) {
      return NextResponse.json({ success: false, message: "Invalid authentication token" }, { status: 401 })
    }

    // Verify current password
    if (!verifyPassword(currentPassword, user.password)) {
      return NextResponse.json({ success: false, message: "Current password is incorrect" }, { status: 400 })
    }

    // Update password
    const hashedNewPassword = hashPassword(newPassword)
    await dataStore.updateUser(user.id, { password: hashedNewPassword })

    console.log("✅ Password changed successfully for user:", user.username)

    return NextResponse.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("❌ Change Password API Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Password change failed due to server error",
      },
      { status: 500 },
    )
  }
}
