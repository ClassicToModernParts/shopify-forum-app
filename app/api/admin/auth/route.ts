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

    const trimmedUsername = username?.trim()
    const trimmedPassword = password?.trim()

    if (trimmedUsername === ADMIN_CREDENTIALS.username && trimmedPassword === ADMIN_CREDENTIALS.password) {
      const token = crypto.randomBytes(32).toString("hex")
      return NextResponse.json({
        success: true,
        token,
        message: "Login successful",
      })
    } else {
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
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed",
      },
      { status: 500 },
    )
  }
}
