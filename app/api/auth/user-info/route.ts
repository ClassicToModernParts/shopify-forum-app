import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("👤 User Info API: Checking user authentication")

    // Get session from cookie
    const sessionCookie = request.cookies.get("session")
    if (!sessionCookie) {
      console.log("❌ User Info API: No session cookie found")
      return NextResponse.json({
        success: false,
        message: "Not authenticated",
        user: null,
      })
    }

    const userEmail = sessionCookie.value
    console.log("👤 User Info API: Looking up user by email:", userEmail)

    // Get user from data store
    const user = await persistentForumDataStore.getUserByEmail(userEmail)
    if (!user) {
      console.log("❌ User Info API: User not found")
      return NextResponse.json({
        success: false,
        message: "User not found",
        user: null,
      })
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ User Info API: User account is inactive")
      return NextResponse.json({
        success: false,
        message: "Account is inactive",
        user: null,
      })
    }

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user

    console.log("✅ User Info API: User authenticated:", user.username)
    return NextResponse.json({
      success: true,
      message: "User authenticated",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ User Info API: Error:", error)
    return NextResponse.json({
      success: false,
      message: "Failed to get user info",
      user: null,
    })
  }
}
