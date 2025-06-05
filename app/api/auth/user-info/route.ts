import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

// Verify token function
function verifyToken(token: string): { valid: boolean; userId?: string } {
  try {
    const [header, payload, signature] = token.split(".")

    // Verify signature
    const expectedSignature = crypto
      .createHmac("sha256", "your-secret-key")
      .update(`${header}.${payload}`)
      .digest("base64")

    if (signature !== expectedSignature) {
      return { valid: false }
    }

    // Decode payload
    const decodedPayload = JSON.parse(Buffer.from(payload, "base64").toString())

    // Check expiration
    if (decodedPayload.exp < Date.now()) {
      return { valid: false }
    }

    return { valid: true, userId: decodedPayload.sub }
  } catch (error) {
    console.error("Token verification error:", error)
    return { valid: false }
  }
}

export async function GET() {
  try {
    // Check for auth token in cookies
    const authToken = cookies().get("auth-token")?.value
    const userSession = cookies().get("user-session")?.value

    if (!authToken && !userSession) {
      return NextResponse.json({ success: false, message: "Not authenticated" }, { status: 401 })
    }

    let userId: string | undefined

    // If we have an auth token, verify it
    if (authToken) {
      const verification = verifyToken(authToken)
      if (!verification.valid) {
        return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 })
      }
      userId = verification.userId
    } else if (userSession) {
      // Fall back to user session cookie
      userId = userSession
    }

    if (!userId) {
      return NextResponse.json({ success: false, message: "User ID not found" }, { status: 401 })
    }

    // Get user from database
    const user = await persistentForumDataStore.getUserById(userId)

    if (!user) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 401 })
    }

    // Return user info without sensitive data
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    console.error("User info error:", error)
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 })
  }
}
