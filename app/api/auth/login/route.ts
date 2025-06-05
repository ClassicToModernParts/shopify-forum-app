import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 })
    }

    console.log(`🔐 Login attempt for username: ${username}`)

    // Verify user credentials
    const user = await dataStore.verifyPassword(username, password)

    if (!user) {
      console.log(`❌ Invalid credentials for username: ${username}`)
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 })
    }

    if (!user.isActive) {
      console.log(`❌ Inactive user attempted login: ${username}`)
      return NextResponse.json({ error: "Account is deactivated" }, { status: 401 })
    }

    console.log(`✅ Successful login for user: ${username}`)

    // Create response with user info (excluding password)
    const userInfo = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    const response = NextResponse.json({
      success: true,
      user: userInfo,
      message: "Login successful",
    })

    // Set authentication cookie
    response.cookies.set("auth-token", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("❌ Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
