import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log("Login attempt:", { username, password: password ? "***" : "empty" })
    console.log("Expected:", { username: ADMIN_CREDENTIALS.username, password: "***" })

    // Trim whitespace and check
    const trimmedUsername = username?.trim()
    const trimmedPassword = password?.trim()

    if (trimmedUsername === ADMIN_CREDENTIALS.username && trimmedPassword === ADMIN_CREDENTIALS.password) {
      const token = crypto.randomBytes(32).toString("hex")
      console.log("Login successful for:", trimmedUsername)
      return NextResponse.json({
        success: true,
        token,
        message: "Login successful",
      })
    } else {
      console.log("Login failed - credentials don't match")
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password",
          debug: {
            receivedUsername: trimmedUsername || "",
            receivedPasswordLength: trimmedPassword?.length || 0,
            expectedUsername: ADMIN_CREDENTIALS.username,
            expectedPasswordLength: ADMIN_CREDENTIALS.password.length,
          },
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Admin auth error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
