import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

// Generate a simple session token
function generateSessionToken(user: any): string {
  const timestamp = Date.now()
  const randomBytes = crypto.randomBytes(16).toString("hex")
  const userHash = crypto
    .createHash("sha256")
    .update(user.id + user.email)
    .digest("hex")
    .substring(0, 8)
  return `${userHash}-${timestamp}-${randomBytes}`
}

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

      // Check if user exists for debugging
      const existingUser = await persistentForumDataStore.getUserByUsername(username)

      return NextResponse.json(
        {
          success: false,
          error: existingUser ? "Invalid password" : "Invalid username",
          debug: {
            userExists: !!existingUser,
            receivedUsername: username,
            receivedPasswordLength: password.length,
          },
        },
        { status: 401 },
      )
    }

    console.log("✅ Login API: Valid credentials for:", username)

    // Generate session token
    const sessionToken = generateSessionToken(user)

    // Create response with user info (excluding password)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const response = NextResponse.json({
      success: true,
      token: sessionToken,
      user: userInfo,
      message: "Login successful",
    })

    // Set multiple cookies for reliability
    response.cookies.set("auth-token", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("user-session", user.id, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    response.cookies.set("user-email", user.email, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("✅ Login API: Session created for:", username)
    return response
  } catch (error) {
    console.error("❌ Login API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
