import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function POST(request: Request) {
  try {
    console.log("🔐 Login API: Starting login process")

    const { username, password } = await request.json()

    if (!username || !password) {
      console.log("❌ Login API: Missing credentials")
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 },
      )
    }

    console.log("🔍 Login API: Checking credentials for:", username)

    // Ensure data store is initialized
    if (!(await persistentForumDataStore.isInitialized())) {
      console.log("⚠️ Login API: Data store not initialized, initializing now...")
      await persistentForumDataStore.initialize()
    }

    // Verify credentials
    const user = await persistentForumDataStore.verifyPassword(username, password)

    if (!user) {
      console.log("❌ Login API: Invalid credentials for:", username)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      )
    }

    console.log("✅ Login API: Valid credentials for:", username)

    // Create simple session token
    const sessionToken = `session_${user.id}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create user info (excluding password)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name || user.username,
      role: user.role,
    }

    // Create response
    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      user: userInfo,
      message: "Login successful",
    })

    // Set cookies with proper settings
    const cookieOptions = {
      httpOnly: false, // Allow JavaScript access
      secure: false, // Allow HTTP in development
      sameSite: "lax" as const,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    }

    response.cookies.set("authToken", sessionToken, cookieOptions)
    response.cookies.set("userId", user.id, cookieOptions)
    response.cookies.set("userEmail", user.email, cookieOptions)
    response.cookies.set("userName", user.name || user.username, cookieOptions)
    response.cookies.set("userRole", user.role, cookieOptions)

    console.log("✅ Login API: Session created and cookies set for:", username)
    return response
  } catch (error) {
    console.error("❌ Login API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
