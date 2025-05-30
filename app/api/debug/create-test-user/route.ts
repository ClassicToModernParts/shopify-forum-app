import { NextResponse } from "next/server"
import { authService } from "@/lib/auth-service"

export async function POST() {
  try {
    console.log("🧪 Debug: Creating test user")

    const result = await authService.registerUser({
      username: "testuser",
      name: "Test User",
      password: "password123",
    })

    console.log("🧪 Debug: Test user creation result:", result)

    return NextResponse.json({
      success: true,
      result,
    })
  } catch (error) {
    console.error("❌ Debug: Error creating test user:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
