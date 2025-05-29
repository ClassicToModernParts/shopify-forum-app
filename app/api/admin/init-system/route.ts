import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../../forum/data-store"

export async function GET() {
  try {
    // Check if system is initialized
    const categories = forumDataStore.getCategories(true)
    const users = await forumDataStore.getUsers()

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
    const users = await forumDataStore.getUsers()
    let adminUser = users.find((user) => user.role === "admin")

    if (!adminUser) {
      adminUser = await forumDataStore.addUser({
        username: "admin",
        name: "System Administrator",
        password: "admin123", // This should be hashed in production
        role: "admin",
      })
      console.log("✅ Created admin user:", adminUser.username)
    }

    // Create default categories if they don't exist
    const categories = forumDataStore.getCategories(true)
    if (!Array.isArray(categories) || categories.length === 0) {
      const generalCategory = forumDataStore.createCategory({
        name: "General Discussion",
        description: "General topics related to our products",
        color: "#3B82F6",
        icon: "MessageSquare",
        isPrivate: false,
      })

      const supportCategory = forumDataStore.createCategory({
        name: "Product Support",
        description: "Get help with our products",
        color: "#10B981",
        icon: "HelpCircle",
        isPrivate: false,
      })

      const announcementsCategory = forumDataStore.createCategory({
        name: "Announcements",
        description: "Official announcements from our team",
        color: "#F59E0B",
        icon: "Megaphone",
        isPrivate: false,
      })

      console.log("✅ Created default categories")

      // Create welcome post
      forumDataStore.createPost({
        title: "Welcome to our community forum!",
        content: "This is the first post in our community forum. Feel free to introduce yourself!",
        author: "Admin",
        categoryId: generalCategory.id,
        tags: ["welcome", "introduction"],
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
