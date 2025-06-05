import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

// Hash function for passwords
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

// Generate auth token
function generateToken(user: any): string {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    iat: Date.now(),
  }
  return Buffer.from(JSON.stringify(payload)).toString("base64")
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔐 Login API: Starting login process")

    // Parse request body
    const body = await request.json()
    const { username, password } = body

    console.log("🔐 Login API: Login attempt for:", username)

    // Validate input
    if (!username || !password) {
      console.log("❌ Login API: Missing username or password")
      return NextResponse.json(
        {
          success: false,
          message: "Username and password are required",
        },
        { status: 400 },
      )
    }

    // Initialize data store if needed
    console.log("🔄 Login API: Checking data store initialization")
    const isInitialized = await persistentForumDataStore.isInitialized()
    if (!isInitialized) {
      console.log("🔄 Login API: Initializing data store")
      await persistentForumDataStore.initialize()
    }

    // Find user by username
    console.log("🔍 Login API: Looking up user")
    const user = await persistentForumDataStore.getUserByUsername(username)

    if (!user) {
      console.log("❌ Login API: User not found")
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 },
      )
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ Login API: User account is inactive")
      return NextResponse.json(
        {
          success: false,
          message: "Account is inactive. Please contact support.",
        },
        { status: 401 },
      )
    }

    // Verify password
    console.log("🔐 Login API: Verifying password")
    const hashedPassword = hashPassword(password)
    if (user.password !== hashedPassword) {
      console.log("❌ Login API: Invalid password")
      return NextResponse.json(
        {
          success: false,
          message: "Invalid username or password",
        },
        { status: 401 },
      )
    }

    // Update last active timestamp
    console.log("📝 Login API: Updating last active timestamp")
    await persistentForumDataStore.updateUser(user.id, {
      lastActive: new Date().toISOString(),
    })

    // Generate token
    console.log("🎫 Login API: Generating auth token")
    const token = generateToken(user)

    // Prepare user data (without password)
    const { password: _, ...userWithoutPassword } = user

    console.log("✅ Login API: Login successful for:", username)

    // Create response
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userWithoutPassword,
      token,
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
    response.cookies.set("authToken", token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    })

    return response
  } catch (error) {
    console.error("❌ Login API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Login failed due to server error",
      },
      { status: 500 },
    )
  }
}
