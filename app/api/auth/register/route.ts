import { type NextRequest, NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, name, password, securityQuestion, securityAnswer } = body

    // Validate input
    if (!username || !name || !password) {
      return NextResponse.json(
        { success: false, message: "Username, name, and password are required" },
        { status: 400 },
      )
    }

    if (!securityQuestion || !securityAnswer) {
      return NextResponse.json(
        { success: false, message: "Security question and answer are required" },
        { status: 400 },
      )
    }

    // Validate username length
    if (username.length < 3) {
      return NextResponse.json(
        { success: false, message: "Username must be at least 3 characters long" },
        { status: 400 },
      )
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    // Register user
    const result = await authService.registerUser({
      username,
      name,
      password,
    })

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 })
    }

    // Add security question after successful registration
    if (result.user) {
      const { forumDataStore } = await import("@/app/api/forum/data-store")
      forumDataStore.updateSecurityQuestion(result.user.id, securityQuestion, securityAnswer)
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
