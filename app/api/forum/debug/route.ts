import { NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET() {
  try {
    console.log("🔍 Debug: Getting data store state")

    const categories = forumDataStore.getCategories()
    const posts = forumDataStore.getPosts()
    const users = forumDataStore.getUsers()
    const settings = forumDataStore.getSettings()

    const debugInfo = {
      timestamp: new Date().toISOString(),
      categories: {
        count: Array.isArray(categories) ? categories.length : 0,
        data: categories,
      },
      posts: {
        count: Array.isArray(posts) ? posts.length : 0,
        data: posts,
      },
      users: {
        count: Array.isArray(users) ? users.length : 0,
        data: users.map((u) => ({ id: u.id, username: u.username, role: u.role })), // Don't expose passwords
      },
      settings: settings,
    }

    console.log("📊 Debug info:", debugInfo)

    return NextResponse.json({
      success: true,
      data: debugInfo,
      message: "Debug information retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Debug endpoint error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get debug information",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
