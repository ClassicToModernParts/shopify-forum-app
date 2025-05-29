import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body

    // Validate input
    if (!username || !password) {
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    // Login user
    const result = await authService.loginUser({
      username,
      password,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 401 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Login failed" }, { status: 500 })
  }
}
