import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"
import { ensureDataStoreInitialized } from "@/lib/data-store-manager"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API: Request received")

    // Ensure data store is initialized before proceeding
    const initialized = await ensureDataStoreInitialized()
    if (!initialized) {
      console.error("❌ Login API: Data store initialization failed")
      return NextResponse.json(
        {
          success: false,
          message: "System initialization failed. Please try again later.",
        },
        { status: 500 },
      )
    }

    const body = await request.json()
    const { username, password } = body

    console.log(`🔐 Login API: Attempting login for username: ${username}`)

    // Validate input
    if (!username || !password) {
      console.log("❌ Login API: Missing username or password")
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    // Login user
    const result = await authService.loginUser({
      username,
      password,
    })

    console.log(`🔐 Login API: Auth service result:`, {
      success: result.success,
      message: result.message,
      hasUser: !!result.user,
      hasToken: !!result.token,
    })

    if (!result.success) {
      console.log(`❌ Login API: Login failed for ${username}: ${result.message}`)
      return NextResponse.json(
        {
          success: false,
          message: result.message,
        },
        { status: 401 },
      )
    }

    console.log(`✅ Login API: Login successful for ${username}`)

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: result.user,
      token: result.token,
    })

    // Set session cookie with user email
    response.cookies.set("session", result.user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Set auth token cookie (for client-side access)
    response.cookies.set("authToken", result.token, {
      httpOnly: false, // Allow client-side access
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    console.log("🍪 Login API: Cookies set successfully")

    return response
  } catch (error) {
    console.error("❌ Login API: Unexpected error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Login failed due to server error",
      },
      { status: 500 },
    )
  }
}
