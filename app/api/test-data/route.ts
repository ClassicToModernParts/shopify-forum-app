import { NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"

export async function GET() {
  try {
    const users = forumDataStore.getUsers()
    const categories = forumDataStore.getCategories()
    const posts = forumDataStore.getPosts()

    return NextResponse.json({
      success: true,
      data: {
        users: users.map((u) => ({ id: u.id, username: u.username, name: u.name, createdAt: u.createdAt })),
        categories: categories.length,
        posts: posts.length,
        totalUsers: users.length,
      },
    })
  } catch (error) {
    console.error("Test data error:", error)
    return NextResponse.json({ success: false, error: "Failed to retrieve data" }, { status: 500 })
  }
}
