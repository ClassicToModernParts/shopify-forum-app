import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function simpleHash(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex")
}

export async function POST(request: Request) {
  try {
    const { username, password, name, email } = await request.json()

    if (!username || !password || !name || !email) {
      return NextResponse.json({ success: false, message: "All fields are required" }, { status: 400 })
    }

    // Check if user already exists
    const existingUser = await persistentForumDataStore.getUserByUsername(username)
    if (existingUser) {
      return NextResponse.json({ success: false, message: "Username already exists" }, { status: 400 })
    }

    const existingEmail = await persistentForumDataStore.getUserByEmail(email)
    if (existingEmail) {
      return NextResponse.json({ success: false, message: "Email already exists" }, { status: 400 })
    }

    // Create new user
    const newUser = await persistentForumDataStore.addUser({
      username,
      name,
      email,
      password: simpleHash(password),
      role: "user",
      isActive: true,
      emailVerified: true,
    })

    console.log("✅ User created via debug endpoint:", newUser.username)

    return NextResponse.json({
      success: true,
      message: "User created successfully",
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json({ success: false, message: "Failed to create user" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: "POST to this endpoint to create a user",
    example: {
      username: "testuser",
      password: "password123",
      name: "Test User",
      email: "test@example.com",
    },
  })
}
