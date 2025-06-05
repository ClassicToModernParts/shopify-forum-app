import { type NextRequest, NextResponse } from "next/server"
import { dataStore } from "@/lib/persistent-data-store"

export async function POST(request: NextRequest) {
  try {
    const { username, email, password, name } = await request.json()

    if (!username || !email || !password) {
      return NextResponse.json({ error: "Username, email, and password are required" }, { status: 400 })
    }

    console.log(`📝 Registration attempt for username: ${username}`)

    // Check if user already exists
    const existingUserByUsername = await dataStore.getUserByUsername(username)
    if (existingUserByUsername) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 })
    }

    const existingUserByEmail = await dataStore.getUserByEmail(email)
    if (existingUserByEmail) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = await dataStore.createUser({
      username,
      email,
      password, // Will be hashed in createUser method
      name: name || username,
      role: "user",
      isActive: true,
    })

    if (!newUser) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    console.log(`✅ User registered successfully: ${username}`)

    // Return user info (excluding password)
    const userInfo = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
    }

    const response = NextResponse.json({
      success: true,
      user: userInfo,
      message: "Registration successful",
    })

    // Set authentication cookie
    response.cookies.set("auth-token", newUser.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
