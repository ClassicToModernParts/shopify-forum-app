import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"
import * as crypto from "crypto"

function simpleHash(str: string): string {
  return crypto.createHash("sha256").update(str).digest("hex")
}

export async function GET() {
  try {
    console.log("🔄 Reinitializing authentication system...")

    // Get current users
    const users = await persistentForumDataStore.getUsers()

    // Reset admin and demo user passwords with consistent hashing
    for (const user of users) {
      if (user.username === "admin") {
        user.password = simpleHash("admin123")
        console.log("🔐 Reset admin password hash:", user.password.substring(0, 10) + "...")
      } else if (user.username === "demo") {
        user.password = simpleHash("demo123")
        console.log("🔐 Reset demo password hash:", user.password.substring(0, 10) + "...")
      }
    }

    // Save updated users
    const store = await persistentForumDataStore.getStore()
    await store.set("ctm:users", users)

    return NextResponse.json({
      success: true,
      message: "Authentication system reinitialized",
      users: users.map((u) => ({
        username: u.username,
        passwordHash: u.password.substring(0, 10) + "...",
      })),
    })
  } catch (error) {
    console.error("Error reinitializing auth system:", error)
    return NextResponse.json({ success: false, message: "Failed to reinitialize auth system" }, { status: 500 })
  }
}
