import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API: Request received")

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
    return NextResponse.json(result)
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
