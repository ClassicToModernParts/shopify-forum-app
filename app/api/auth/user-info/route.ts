import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { ensureDataStoreInitialized } from "@/lib/data-store-manager"

export async function GET(request: NextRequest) {
  try {
    console.log("👤 User Info API: Request received")

    // Ensure data store is initialized
    const initialized = await ensureDataStoreInitialized()
    if (!initialized) {
      console.error("❌ User Info API: Data store initialization failed")
      return NextResponse.json(
        {
          success: false,
          error: "System initialization failed. Please try again later.",
        },
        { status: 500 },
      )
    }

    // Get auth token from header
    const authHeader = request.headers.get("authorization")
    const token = authHeader?.split(" ")[1]

    // Get user email from session cookie
    const sessionCookie = request.cookies.get("session")
    const userEmail = sessionCookie?.value

    console.log(`👤 User Info API: Auth check - Token: ${!!token}, Session: ${!!userEmail}`)

    // If no token or session, return error
    if (!token && !userEmail) {
      console.log("❌ User Info API: No authentication provided")
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required",
        },
        { status: 401 },
      )
    }

    let user = null

    // Try to get user from token
    if (token) {
      try {
        const tokenData = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString())
        const tokenEmail = tokenData.email

        if (tokenEmail) {
          user = await persistentForumDataStore.getUserByEmail(tokenEmail)
          console.log(`👤 User Info API: User from token - ${user ? "found" : "not found"}`)
        }
      } catch (error) {
        console.error("❌ User Info API: Error parsing token:", error)
      }
    }

    // If no user from token, try session
    if (!user && userEmail) {
      user = await persistentForumDataStore.getUserByEmail(userEmail)
      console.log(`👤 User Info API: User from session - ${user ? "found" : "not found"}`)
    }

    // If still no user, return error
    if (!user) {
      console.log("❌ User Info API: User not found")
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    // Return user info (excluding password)
    const { password, ...userWithoutPassword } = user
    console.log("✅ User Info API: User found and returned")

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ User Info API: Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get user information",
      },
      { status: 500 },
    )
  }
}
