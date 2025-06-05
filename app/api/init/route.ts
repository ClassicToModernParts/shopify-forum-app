import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Manual initialization requested")

    // Force reinitialize
    await persistentForumDataStore.forceReinitialize()

    // Get current users to verify
    const users = await persistentForumDataStore.getUsers()
    console.log("👥 Users after initialization:", users.length)

    return NextResponse.json({
      success: true,
      message: "System initialized successfully",
      userCount: users.length,
      users: users.map((u) => ({ username: u.username, email: u.email, role: u.role })),
    })
  } catch (error) {
    console.error("❌ Initialization failed:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Initialization failed",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

export async function GET() {
  try {
    const isInit = await persistentForumDataStore.isInitialized()
    const users = await persistentForumDataStore.getUsers()
    const stats = await persistentForumDataStore.getStats()

    return NextResponse.json({
      initialized: isInit,
      userCount: users.length,
      stats,
      defaultUsers: [
        { username: "admin", password: "admin123", role: "admin" },
        { username: "demo", password: "demo123", role: "user" },
      ],
    })
  } catch (error) {
    console.error("❌ Status check failed:", error)
    return NextResponse.json({
      initialized: false,
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
