import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET() {
  try {
    console.log("🔍 Forum Debug: Checking data store status...")

    // Check if initialized
    const isInitialized = await persistentForumDataStore.isInitialized()
    console.log("📊 Initialized:", isInitialized)

    if (!isInitialized) {
      console.log("🔄 Initializing data store...")
      await persistentForumDataStore.initialize()
    }

    // Get all data
    const categories = await persistentForumDataStore.getCategories()
    const posts = await persistentForumDataStore.getPosts()
    const users = await persistentForumDataStore.getUsers()
    const stats = await persistentForumDataStore.getStats()

    console.log("📋 Categories:", categories.length)
    console.log("📝 Posts:", posts.length)
    console.log("👥 Users:", users.length)

    return NextResponse.json({
      success: true,
      debug: {
        initialized: isInitialized,
        categories: categories.length,
        posts: posts.length,
        users: users.length,
        stats,
        sampleCategory: categories[0] || null,
        samplePost: posts[0] || null,
      },
      data: {
        categories,
        posts: posts.slice(0, 3), // First 3 posts only
        users: users.map((u) => ({ id: u.id, username: u.username, email: u.email })), // Safe user data
      },
    })
  } catch (error) {
    console.error("❌ Forum Debug Error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
