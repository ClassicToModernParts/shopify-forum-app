import { NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"

export async function GET() {
  try {
    const debugInfo = await forumDataStore.getDebugInfo()
    const users = await forumDataStore.getUsers()

    // Only return safe user info (no passwords)
    const safeUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.name,
      role: user.role,
      createdAt: user.createdAt,
      lastActive: user.lastActive,
    }))

    return NextResponse.json({
      success: true,
      debugInfo,
      users: safeUsers,
      userCount: safeUsers.length,
    })
  } catch (error) {
    console.error("Debug data store error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve debug info",
        errorMessage: (error as Error).message,
      },
      { status: 500 },
    )
  }
}
