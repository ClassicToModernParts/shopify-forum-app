import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import { emailService } from "@/lib/email-service"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function generateToken(length = 32): string {
  return crypto.randomBytes(length).toString("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API: Starting login process")

    const { username, password } = await request.json()
    console.log("🔐 Login API: Received credentials for:", username)

    if (!username || !password) {
      console.log("❌ Login API: Missing credentials")
      return NextResponse.json({ success: false, message: "Username and password required" }, { status: 400 })
    }

    // Ensure data store is initialized
    console.log("🔄 Login API: Checking initialization")
    if (!(await persistentForumDataStore.isInitialized())) {
      console.log("🔄 Login API: Initializing data store")
      await persistentForumDataStore.initialize()
    }

    // Find user
    console.log("🔍 Login API: Looking up user:", username)
    const user = await persistentForumDataStore.getUserByUsername(username)

    if (!user) {
      console.log("❌ Login API: User not found:", username)
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    console.log("👤 Login API: User found:", user.username, "| Active:", user.isActive)

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ Login API: User account inactive")
      return NextResponse.json({ success: false, message: "Account is inactive" }, { status: 401 })
    }

    // Verify password
    console.log("🔐 Login API: Verifying password")
    const hashedPassword = hashPassword(password)
    console.log(
      "🔐 Login API: Password hashes - Input:",
      hashedPassword.substring(0, 10) + "...",
      "| Stored:",
      user.password.substring(0, 10) + "...",
    )

    if (user.password !== hashedPassword) {
      console.log("❌ Login API: Password mismatch")
      return NextResponse.json({ success: false, message: "Invalid username or password" }, { status: 401 })
    }

    // Update last active
    console.log("📝 Login API: Updating last active timestamp")
    await persistentForumDataStore.updateUser(user.id, {
      lastActive: new Date().toISOString(),
    })

    // Generate auth token
    const authToken = generateToken()

    // Store token with user
    await persistentForumDataStore.storeUserToken(user.id, authToken)

    // Send login notification email (non-blocking)
    try {
      console.log("📧 Login API: Sending login notification email")
      await emailService.sendLoginNotificationEmail(
        user.email,
        user.name,
        request.headers.get("user-agent") || "Unknown device",
      )
    } catch (emailError) {
      console.warn("⚠️ Login notification email error:", emailError)
      // Don't block login if email fails
    }

    // Create response
    const { password: _, ...userWithoutPassword } = user
    console.log("✅ Login API: Login successful for:", username)

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token: authToken,
    })

    // Set session cookie
    response.cookies.set("session", user.email, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    // Set auth token cookie
    response.cookies.set("authToken", authToken, {
      httpOnly: false, // Accessible to JavaScript
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Login API: Error:", error)
    return NextResponse.json({ success: false, message: "Server error during login" }, { status: 500 })
  }
}
