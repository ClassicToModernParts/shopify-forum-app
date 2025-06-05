import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { simpleEmailService } from "@/lib/simple-email-service"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration API: Starting registration")

    const { username, email, password, name } = await request.json()
    console.log("📝 Registration API: Received data for:", username, email)

    if (!username || !email || !password || !name) {
      console.log("❌ Registration API: Missing required fields")
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      console.log("❌ Registration API: Invalid email format")
      return NextResponse.json({ success: false, message: "Invalid email format" }, { status: 400 })
    }

    // Validate password length
    if (password.length < 6) {
      console.log("❌ Registration API: Password too short")
      return NextResponse.json({ success: false, message: "Password must be at least 6 characters" }, { status: 400 })
    }

    // Ensure data store is initialized
    console.log("🔄 Registration API: Checking initialization")
    if (!(await persistentForumDataStore.isInitialized())) {
      console.log("🔄 Registration API: Initializing data store")
      await persistentForumDataStore.initialize()
    }

    // Check if username exists
    console.log("🔍 Registration API: Checking username availability")
    const existingUsername = await persistentForumDataStore.getUserByUsername(username)
    if (existingUsername) {
      console.log("❌ Registration API: Username already exists")
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 409 })
    }

    // Check if email exists
    console.log("🔍 Registration API: Checking email availability")
    const existingEmail = await persistentForumDataStore.getUserByEmail(email)
    if (existingEmail) {
      console.log("❌ Registration API: Email already exists")
      return NextResponse.json({ success: false, message: "Email already registered" }, { status: 409 })
    }

    // Create user
    console.log("👤 Registration API: Creating user")
    const hashedPassword = hashPassword(password)
    const user = await persistentForumDataStore.addUser({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      name: name.trim(),
      role: "user",
      isActive: true,
      emailVerified: false,
    })

    console.log("✅ Registration API: User created successfully:", user.username)

    // Send welcome email (won't fail registration if email fails)
    try {
      const emailResult = await simpleEmailService.sendWelcomeEmail(user.email, user.name)
      if (emailResult.success) {
        console.log("✅ Welcome email sent to:", user.email)
      } else {
        console.warn("⚠️ Welcome email failed:", emailResult.error)
      }
    } catch (emailError) {
      console.warn("⚠️ Welcome email error:", emailError)
    }

    const { password: _, ...userWithoutPassword } = user
    return NextResponse.json({
      success: true,
      message: "Registration successful! Welcome email sent.",
      user: userWithoutPassword,
    })
  } catch (error) {
    console.error("❌ Registration API: Error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
