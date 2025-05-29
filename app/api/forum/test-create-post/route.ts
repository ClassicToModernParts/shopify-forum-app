import { NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function POST() {
  try {
    console.log("🧪 Testing post creation...")

    // First, ensure we have categories
    let categories = forumDataStore.getCategories()
    console.log("📂 Current categories:", categories)

    if (!Array.isArray(categories) || categories.length === 0) {
      console.log("📂 No categories found, creating test category...")
      const testCategory = forumDataStore.createCategory({
        name: "Test Category",
        description: "Test category for post creation",
        color: "#3B82F6",
        icon: "MessageSquare",
      })
      categories = [testCategory]
      console.log("✅ Test category created:", testCategory)
    }

    // Now try to create a test post
    const testPostData = {
      title: "Test Post",
      content: "This is a test post to verify the post creation functionality.",
      author: "Test User",
      authorEmail: "test@example.com",
      categoryId: categories[0].id,
      tags: ["test", "debug"],
    }

    console.log("📝 Creating test post with data:", testPostData)

    const newPost = forumDataStore.createPost(testPostData)
    console.log("✅ Test post created:", newPost)

    // Get updated stats
    const allPosts = forumDataStore.getPosts()
    const allCategories = forumDataStore.getCategories()

    return NextResponse.json({
      success: true,
      message: "Test post created successfully",
      data: {
        createdPost: newPost,
        totalPosts: allPosts.length,
        totalCategories: allCategories.length,
        testData: testPostData,
      },
    })
  } catch (error) {
    console.error("❌ Test post creation failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Test post creation failed",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 },
    )
  }
}
