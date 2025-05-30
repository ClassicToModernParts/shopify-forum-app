import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

// Simple hash function for passwords (in production, use proper hashing)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

// Simple token generation
function generateToken(userId: string): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2)
  return `${userId}_${timestamp}_${random}`
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, name, password, securityQuestion, securityAnswer } = body

    console.log(`📝 Registration attempt for username: ${username}`)

    // Validate input
    if (!username || !name || !password) {
      return NextResponse.json(
        { success: false, message: "Username, name, and password are required" },
        { status: 400 },
      )
    }

    // Check if username already exists
    try {
      const existingUser = await persistentForumDataStore.getUserByUsername(username)
      if (existingUser) {
        console.log(`❌ Username ${username} already exists`)
        return NextResponse.json({ success: false, message: "Username is already taken" }, { status: 409 })
      }
    } catch (error) {
      console.error("Error checking existing username:", error)
      return NextResponse.json({ success: false, message: "Error checking username availability" }, { status: 500 })
    }

    // Check if email already exists (generate email from username)
    const email = `${username}@example.com`
    try {
      const existingEmail = await persistentForumDataStore.getUserByEmail(email)
      if (existingEmail) {
        console.log(`❌ Email ${email} already exists`)
        return NextResponse.json({ success: false, message: "Email is already registered" }, { status: 409 })
      }
    } catch (error) {
      console.error("Error checking existing email:", error)
      return NextResponse.json({ success: false, message: "Error checking email availability" }, { status: 500 })
    }

    // Hash the password
    const hashedPassword = simpleHash(password)

    // Create the user
    try {
      const newUser = await persistentForumDataStore.addUser({
        username,
        name,
        email,
        password: hashedPassword,
        role: "user",
      })

      console.log(`✅ User ${username} registered successfully with ID: ${newUser.id}`)

      // Generate token
      const token = generateToken(newUser.id)

      return NextResponse.json({
        success: true,
        message: "User registered successfully",
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          username: newUser.username,
        },
      })
    } catch (error) {
      console.error("Error creating user:", error)
      return NextResponse.json({ success: false, message: "Failed to create user account" }, { status: 500 })
    }
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
