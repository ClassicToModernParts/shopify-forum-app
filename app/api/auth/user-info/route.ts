import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 User info API called")

    // Get token from Authorization header
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    // Get session cookie
    const sessionCookie = request.cookies.get("session")?.value

    console.log("🔐 Auth sources:", {
      hasToken: !!token,
      hasSessionCookie: !!sessionCookie,
    })

    let userEmail = null

    // Try to get user email from session cookie first
    if (sessionCookie) {
      userEmail = sessionCookie
      console.log("📧 Using email from session cookie:", userEmail)
    }

    // If no session cookie, try to get from token
    if (!userEmail && token) {
      try {
        // Simple token parsing (in production, use proper JWT verification)
        const tokenParts = token.split("_")
        if (tokenParts.length >= 3) {
          // Try to get user by token
          const users = await persistentForumDataStore.getUsers()
          const user = users.find((u) => u.id === tokenParts[0])
          if (user) {
            userEmail = user.email
            console.log("📧 Using email from token:", userEmail)
          }
        }
      } catch (error) {
        console.error("Error parsing token:", error)
      }
    }

    if (!userEmail) {
      console.log("❌ No user email found from any source")
      return NextResponse.json(
        {
          success: false,
          error: "No authentication found",
        },
        { status: 401 },
      )
    }

    // Get user from data store
    const user = await persistentForumDataStore.getUserByEmail(userEmail)

    if (!user) {
      console.log("❌ User not found in database:", userEmail)
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Return user info (excluding password)
    const { password, ...userInfo } = user

    console.log("✅ User info retrieved successfully:", userInfo.email)

    return NextResponse.json({
      success: true,
      user: userInfo,
    })
  } catch (error) {
    console.error("❌ Error in user-info API:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
