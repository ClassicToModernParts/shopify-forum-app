import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "../../../lib/persistent-data-store"

export async function GET() {
  try {
    // Check if system is initialized
    const categories = await persistentForumDataStore.getCategories()
    const users = await persistentForumDataStore.getUsers()

    const isInitialized = {
      hasCategories: Array.isArray(categories) && categories.length > 0,
      hasUsers: Array.isArray(users) && users.length > 0,
      isReady: false,
    }

    isInitialized.isReady = isInitialized.hasCategories && isInitialized.hasUsers

    return NextResponse.json({
      success: true,
      data: isInitialized,
      message: "System initialization status retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Error checking system initialization:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to check system initialization: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Initialize the system
    console.log("🔄 Initializing system...")

    // Create admin user if it doesn't exist
    const users = await persistentForumDataStore.getUsers()
    let adminUser = users.find((user) => user.role === "admin")

    if (!adminUser) {
      adminUser = await persistentForumDataStore.addUser({
        username: "admin",
        name: "System Administrator",
        email: "admin@store.com",
        password: "admin123", // This should be hashed in production
        role: "admin",
      })
      console.log("✅ Created admin user:", adminUser.username)
    }

    // Create default categories if they don't exist
    const categories = await persistentForumDataStore.getCategories()
    if (!Array.isArray(categories) || categories.length === 0) {
      const generalCategory = await persistentForumDataStore.createCategory({
        name: "General Discussion",
        description: "General topics related to CTM parts and products",
        color: "#3B82F6",
        icon: "MessageSquare",
        isPrivate: false,
      })

      const supportCategory = await persistentForumDataStore.createCategory({
        name: "Installation Help",
        description: "Get help with installing CTM parts",
        color: "#10B981",
        icon: "HelpCircle",
        isPrivate: false,
      })

      const showcaseCategory = await persistentForumDataStore.createCategory({
        name: "Project Showcase",
        description: "Show off your builds and projects using CTM parts",
        color: "#F59E0B",
        icon: "Star",
        isPrivate: false,
      })

      const troubleshootingCategory = await persistentForumDataStore.createCategory({
        name: "Troubleshooting",
        description: "Technical support and problem solving",
        color: "#EF4444",
        icon: "AlertTriangle",
        isPrivate: false,
      })

      console.log("✅ Created default categories")

      // Create welcome post
      await persistentForumDataStore.createPost({
        title: "Welcome to CTM Parts Community!",
        content:
          "Welcome to the CTM Parts Community forum! This is where you can get help, share your projects, and connect with other CTM parts enthusiasts. Feel free to introduce yourself and let us know what you're working on!",
        author: "Admin",
        authorEmail: "admin@store.com",
        categoryId: generalCategory.id,
        tags: ["welcome", "introduction", "community"],
      })

      console.log("✅ Created welcome post")
    }

    return NextResponse.json({
      success: true,
      data: {
        initialized: true,
        message: "System initialized successfully",
      },
    })
  } catch (error) {
    console.error("❌ Error initializing system:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to initialize system: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
