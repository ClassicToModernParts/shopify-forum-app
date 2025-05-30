import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "With1999*",
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    const trimmedUsername = username?.trim()
    const trimmedPassword = password?.trim()

    if (trimmedUsername === ADMIN_CREDENTIALS.username && trimmedPassword === ADMIN_CREDENTIALS.password) {
      // Create a secure token with high entropy
      const token = crypto.randomBytes(48).toString("hex")

      return NextResponse.json({
        success: true,
        token,
        message: "Login successful",
        expiresIn: 24 * 60 * 60, // 24 hours in seconds
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid username or password",
        },
        { status: 401 },
      )
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 },
    )
  }
}
