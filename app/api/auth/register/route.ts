import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex")
}

function hashAnswer(answer: string): string {
  return crypto.createHash("sha256").update(answer.toLowerCase().trim()).digest("hex")
}

export async function POST(request: NextRequest) {
  try {
    console.log("📝 Registration API: Starting registration")

    const { username, password, name, securityQuestions } = await request.json()
    console.log("📝 Registration API: Received data for:", username, name)

    if (!username || !password || !name) {
      console.log("❌ Registration API: Missing required fields")
      return NextResponse.json(
        { success: false, message: "Username, password, and name are required" },
        { status: 400 },
      )
    }

    // Validate security questions
    if (!securityQuestions || securityQuestions.length !== 2) {
      console.log("❌ Registration API: Invalid security questions")
      return NextResponse.json({ success: false, message: "Two security questions are required" }, { status: 400 })
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

    // Create user with security questions
    console.log("👤 Registration API: Creating user")
    const hashedPassword = hashPassword(password)

    // Hash security question answers for storage
    const hashedSecurityQuestions = securityQuestions.map((sq: any) => ({
      question: sq.question,
      answer: hashAnswer(sq.answer),
    }))

    const user = await persistentForumDataStore.addUser({
      username: username.trim(),
      email: `${username.trim()}@local.user`, // Generate a placeholder email for internal use
      password: hashedPassword,
      name: name.trim(),
      role: "user",
      isActive: true,
      emailVerified: true, // No email verification needed
      securityQuestions: hashedSecurityQuestions,
    })

    console.log("✅ Registration API: User created successfully:", user.username)

    const { password: _, securityQuestions: __, ...userWithoutSensitiveData } = user
    return NextResponse.json({
      success: true,
      message: "Registration successful!",
      user: userWithoutSensitiveData,
    })
  } catch (error) {
    console.error("❌ Registration API: Error:", error)
    return NextResponse.json({ success: false, message: "Registration failed" }, { status: 500 })
  }
}
