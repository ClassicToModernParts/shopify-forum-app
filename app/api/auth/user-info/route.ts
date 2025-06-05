import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { cookies } from "next/headers"

export async function GET() {
  try {
    console.log("🔍 User Info API: Checking authentication")

    // Get token from cookies
    const cookieStore = cookies()
    const authToken = cookieStore.get("authToken")?.value
    const userId = cookieStore.get("userId")?.value

    console.log("🔍 User Info API: Token exists:", !!authToken)
    console.log("🔍 User Info API: User ID:", userId)

    if (!authToken || !userId) {
      console.log("❌ User Info API: No auth token or user ID")
      return NextResponse.json({
        success: false,
        error: "Not authenticated",
      })
    }

    // Validate token format
    if (!authToken.startsWith("session_") || !authToken.includes(userId)) {
      console.log("❌ User Info API: Invalid token format")
      return NextResponse.json({
        success: false,
        error: "Invalid token",
      })
    }

    // Get user from data store
    const user = await persistentForumDataStore.getUserById(userId)

    if (!user) {
      console.log("❌ User Info API: User not found:", userId)
      return NextResponse.json({
        success: false,
        error: "User not found",
      })
    }

    if (!user.isActive) {
      console.log("❌ User Info API: User inactive:", userId)
      return NextResponse.json({
        success: false,
        error: "User inactive",
      })
    }

    // Return user info
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      role: user.role,
    }

    console.log("✅ User Info API: User authenticated:", user.username)

    return NextResponse.json({
      success: true,
      user: userInfo,
      token: authToken,
    })
  } catch (error) {
    console.error("❌ User Info API: Error:", error)
    return NextResponse.json({
      success: false,
      error: "Internal server error",
    })
  }
}
