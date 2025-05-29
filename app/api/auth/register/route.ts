import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, username, password, name } = body

    // Validate input
    if (!email || !username || !password || !name) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 })
    }

    // Register user
    const result = await authService.registerUser({
      email,
      username,
      password,
      name,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
