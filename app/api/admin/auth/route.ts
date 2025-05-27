import { type NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123",
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
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
      },
      { status: 500 },
    )
  }
}
