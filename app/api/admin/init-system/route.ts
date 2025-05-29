import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "@/app/api/forum/data-store"
import { authService } from "@/lib/auth-service"

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 System initialization started")

    // Create default admin user
    const adminResult = await authService.registerUser({
      username: "admin",
      name: "System Administrator",
      password: "admin123", // Change this in production!
    })

    if (!adminResult.success) {
      console.error("❌ Failed to create admin user:", adminResult.message)
      return NextResponse.json(
        {
          success: false,
          message: `Failed to create admin user: ${adminResult.message}`,
        },
        { status: 500 },
      )
    }

    // Create default categories
    const defaultCategories = [
      {
        name: "General Discussion",
        description: "General topics and discussions",
        color: "#3B82F6",
        icon: "MessageSquare",
        isPrivate: false,
      },
      {
        name: "Support",
        description: "Get help and support",
        color: "#10B981",
        icon: "HelpCircle",
        isPrivate: false,
      },
      {
        name: "Announcements",
        description: "Important announcements and updates",
        color: "#F59E0B",
        icon: "Megaphone",
        isPrivate: false,
      },
    ]

    const createdCategories = []
    for (const categoryData of defaultCategories) {
      try {
        const category = forumDataStore.createCategory(categoryData)
        createdCategories.push(category)
        console.log(`✅ Created category: ${category.name}`)
      } catch (error) {
        console.error(`❌ Failed to create category ${categoryData.name}:`, error)
      }
    }

    // Create a welcome post
    if (createdCategories.length > 0) {
      try {
        const welcomePost = forumDataStore.createPost({
          title: "Welcome to the Community Forum!",
          content: `Welcome to our community forum! 

This is a place where you can:
- Ask questions and get help
- Share ideas and feedback
- Connect with other community members
- Stay updated with announcements

Please be respectful and follow our community guidelines. We're excited to have you here!`,
          author: "System Administrator",
          categoryId: createdCategories[0].id,
          tags: ["welcome", "introduction"],
        })
        console.log(`✅ Created welcome post: ${welcomePost.id}`)
      } catch (error) {
        console.error("❌ Failed to create welcome post:", error)
      }
    }

    console.log("✅ System initialization completed successfully")

    return NextResponse.json({
      success: true,
      message: "System initialized successfully",
      data: {
        adminUser: {
          username: adminResult.user?.username,
          id: adminResult.user?.id,
        },
        categoriesCreated: createdCategories.length,
        defaultPassword: "admin123", // Remove this in production
      },
    })
  } catch (error) {
    console.error("❌ System initialization error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "System initialization failed",
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// GET endpoint to check if system is initialized
export async function GET() {
  try {
    const users = await forumDataStore.getUsers()
    const categories = forumDataStore.getCategories()
    const posts = forumDataStore.getPosts()

    const isInitialized = users.length > 0 || categories.length > 0

    return NextResponse.json({
      success: true,
      isInitialized,
      stats: {
        users: users.length,
        categories: categories.length,
        posts: posts.length,
      },
    })
  } catch (error) {
    console.error("❌ Error checking initialization status:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to check initialization status",
      },
      { status: 500 },
    )
  }
}
