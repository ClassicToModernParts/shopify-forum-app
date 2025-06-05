import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

// Hash function for passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration API: Starting registration process")

    // Parse request body
    const body = await request.json()
    const { name, username, email, password } = body

    console.log("📝 Registration API: Received data:", {
      name: !!name,
      username: !!username,
      email: !!email,
      password: !!password,
    })

    // Validate required fields
    if (!name || !username || !email || !password) {
      console.log("❌ Registration API: Missing required fields")
      return NextResponse.json(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 },
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Registration API: Invalid email format")
      return NextResponse.json(
        {
          success: false,
          message: "Invalid email format",
        },
        { status: 400 },
      )
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Registration API: Password too short")
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 },
      )
    }

    // Validate username length
    if (username.length < 3) {
      console.log("❌ Registration API: Username too short")
      return NextResponse.json(
        {
          success: false,
          message: "Username must be at least 3 characters long",
        },
        { status: 400 },
      )
    }

    // Initialize data store if needed
    console.log("🔄 Registration API: Checking data store initialization")
    const isInitialized = await persistentForumDataStore.isInitialized()
    if (!isInitialized) {
      console.log("🔄 Registration API: Initializing data store")
      await persistentForumDataStore.initialize()
    }

    // Check if username already exists
    console.log("🔍 Registration API: Checking if username exists")
    const existingUsername = await persistentForumDataStore.getUserByUsername(username)
    if (existingUsername) {
      console.log("❌ Registration API: Username already exists")
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        { status: 409 },
      )
    }

    // Check if email already exists
    console.log("🔍 Registration API: Checking if email exists")
    const existingEmail = await persistentForumDataStore.getUserByEmail(email)
    if (existingEmail) {
      console.log("❌ Registration API: Email already exists")
      return NextResponse.json(
        {
          success: false,
          message: "Email is already registered",
        },
        { status: 409 },
      )
    }

    // Hash password
    console.log("🔐 Registration API: Hashing password")
    const hashedPassword = hashPassword(password)

    // Create user
    console.log("👤 Registration API: Creating user")
    const newUser = await persistentForumDataStore.addUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: "user",
      isActive: true,
      lastActive: new Date().toISOString(),
    })

    console.log("✅ Registration API: User created successfully:", newUser.username)

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = newUser
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ Registration API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed due to server error",
      },
      { status: 500 },
    )
  }
}
