import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/app/api/forum/data-store"

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration API called")

    let body
    try {
      body = await request.json()
      console.log("📝 Request body parsed successfully")
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json({ success: false, message: "Invalid request format" }, { status: 400 })
    }

    const { username, name, password, securityQuestion, securityAnswer } = body
    console.log(`📝 Registration attempt for username: ${username}, name: ${name}`)

    // Validate input
    if (!username || !name || !password) {
      console.log("❌ Registration failed: Missing required fields")
      return NextResponse.json(
        { success: false, message: "Username, name, and password are required" },
        { status: 400 },
      )
    }

    if (!securityQuestion || !securityAnswer) {
      console.log("❌ Registration failed: Missing security question or answer")
      return NextResponse.json(
        { success: false, message: "Security question and answer are required" },
        { status: 400 },
      )
    }

    // Validate username length
    if (username.length < 3) {
      console.log("❌ Registration failed: Username too short")
      return NextResponse.json(
        { success: false, message: "Username must be at least 3 characters long" },
        { status: 400 },
      )
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Registration failed: Password too short")
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long" },
        { status: 400 },
      )
    }

    // Replace the auth service call with:
    console.log("🔐 Checking if username already exists")
    const existingUser = await persistentForumDataStore.getUserByUsername(username)
    if (existingUser) {
      console.log(`❌ Registration failed: Username ${username} already exists`)
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    // Create the user directly
    console.log("🔐 Creating new user")
    const newUser = await persistentForumDataStore.addUser({
      username,
      name,
      email: `${username}@community.local`, // Generate email if not provided
      password, // Should be hashed in production
      role: "user",
    })

    const result = {
      success: true,
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      token: `token-${newUser.id}-${Date.now()}`,
    }

    // Add security question after successful registration
    if (result.user) {
      try {
        console.log("🔒 Adding security question")
        const { forumDataStore } = await import("@/app/api/forum/data-store")
        await forumDataStore.updateSecurityQuestion(result.user.id, securityQuestion, securityAnswer)
        console.log("✅ Security question added successfully")
      } catch (securityError) {
        console.error("❌ Error adding security question:", securityError)
        // Don't fail registration if security question fails
        // Just log the error and continue
      }
    }

    console.log("✅ Registration successful")
    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ Registration error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed. Please try again.",
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
