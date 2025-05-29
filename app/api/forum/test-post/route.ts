import { NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET() {
  try {
    console.log("📝 Testing post creation")

    // Get all categories
    const categories = forumDataStore.getCategories()
    console.log(`📂 Found ${categories.length} categories`)

    if (categories.length === 0) {
      console.log("📂 Creating a test category")
      const testCategory = forumDataStore.createCategory({
        name: "Test Category",
        description: "A test category for post creation",
        color: "#FF5733",
        icon: "MessageSquare",
      })
      console.log("📂 Test category created:", testCategory)
    }

    // Get the first category
    const firstCategory = categories[0] || forumDataStore.getCategories()[0]

    if (!firstCategory) {
      return NextResponse.json(
        {
          success: false,
          error: "No categories available for testing",
        },
        { status: 500 },
      )
    }

    // Create a test post
    console.log("📝 Creating a test post")
    const testPost = forumDataStore.createPost({
      title: "Test Post " + new Date().toISOString(),
      content: "This is a test post created at " + new Date().toISOString(),
      author: "Test User",
      categoryId: firstCategory.id,
      tags: ["test", "debug"],
    })

    console.log("📝 Test post created:", testPost)

    // Get all posts
    const posts = forumDataStore.getPosts()

    return NextResponse.json({
      success: true,
      message: "Post creation test completed",
      testPost,
      categories: forumDataStore.getCategories(),
      posts: posts.slice(0, 5), // Return only the first 5 posts to avoid large response
      totalPosts: posts.length,
    })
  } catch (error) {
    console.error("❌ Error in test-post route:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Test failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
