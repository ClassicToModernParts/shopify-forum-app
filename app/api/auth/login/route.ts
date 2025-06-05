import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"
import { cookies } from "next/headers"

// Generate a JWT-like token
function generateToken(user: any): string {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64")
  const payload = Buffer.from(
    JSON.stringify({
      sub: user.id,
      name: user.name || user.username,
      role: user.role,
      iat: Date.now(),
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }),
  ).toString("base64")

  const signature = crypto.createHmac("sha256", "your-secret-key").update(`${header}.${payload}`).digest("base64")

  return `${header}.${payload}.${signature}`
}

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          error: "Username and password are required",
        },
        { status: 400 },
      )
    }

    // Verify credentials
    const user = await persistentForumDataStore.verifyPassword(username, password)

    if (!user) {
      // For debugging, get the user by username to check if it exists
      const existingUser = await persistentForumDataStore.getUserByUsername(username)

      const debug = {
        receivedUsername: username,
        receivedPasswordLength: password.length,
        userExists: !!existingUser,
      }

      if (existingUser) {
        // If user exists but password is wrong, provide more debug info
        const hashedPassword = crypto
          .createHash("sha256")
          .update(password + "ctm_salt")
          .digest("hex")

        debug.receivedPasswordHash = hashedPassword
        debug.storedPasswordHash = existingUser.password
      }

      return NextResponse.json(
        {
          success: false,
          error: existingUser ? "Invalid password" : "Invalid username",
          debug,
        },
        { status: 401 },
      )
    }

    // Generate token
    const token = generateToken(user)

    // Set cookies for server-side auth
    cookies().set({
      name: "auth-token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    })

    cookies().set({
      name: "user-session",
      value: user.id,
      path: "/",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      sameSite: "lax",
    })

    // Return user info and token for client-side storage
    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "An error occurred during login",
      },
      { status: 500 },
    )
  }
}
