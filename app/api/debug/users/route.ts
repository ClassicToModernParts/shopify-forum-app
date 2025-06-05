import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Debug Users API: Getting all users")

    // Ensure data store is initialized
    const isInit = await persistentForumDataStore.isInitialized()
    if (!isInit) {
      await persistentForumDataStore.initialize()
    }

    const users = await persistentForumDataStore.getUsers()

    // Return users without passwords for security
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
      passwordLength: user.password?.length || 0,
      passwordStart: user.password?.substring(0, 10) || "none",
    }))

    console.log("🔍 Debug Users API: Found", safeUsers.length, "users")

    return NextResponse.json({
      success: true,
      users: safeUsers,
      count: safeUsers.length,
    })
  } catch (error) {
    console.error("❌ Debug Users API: Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to get users",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
