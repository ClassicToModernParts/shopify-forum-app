import { NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET() {
  try {
    console.log("🧪 Testing persistent store...")

    // Test getting users
    const users = await persistentForumDataStore.getUsers()
    console.log(`📊 Found ${users.length} users`)

    // Test getting a specific user by username
    const adminUser = await persistentForumDataStore.getUserByUsername("ctm_admin")
    console.log(`👤 Admin user found:`, adminUser ? "Yes" : "No")

    // Test getting categories
    const categories = await persistentForumDataStore.getCategories()
    console.log(`📂 Found ${categories.length} categories`)

    // Test getting posts
    const posts = await persistentForumDataStore.getPosts()
    console.log(`📝 Found ${posts.length} posts`)

    return NextResponse.json({
      success: true,
      data: {
        usersCount: users.length,
        adminUserExists: !!adminUser,
        categoriesCount: categories.length,
        postsCount: posts.length,
        sampleUsers: users.map((u) => ({ id: u.id, username: u.username, name: u.name })),
        sampleCategories: categories.map((c) => ({ id: c.id, name: c.name })),
      },
    })
  } catch (error) {
    console.error("❌ Error testing persistent store:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : String(error),
    })
  }
}
