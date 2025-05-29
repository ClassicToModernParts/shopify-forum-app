import { NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET() {
  try {
    console.log("🔍 Debug: Getting comprehensive data store state")

    const categories = forumDataStore.getCategories()
    const posts = forumDataStore.getPosts()
    const users = await forumDataStore.getUsers()
    const settings = forumDataStore.getSettings()

    // Test category creation
    let testCategoryResult = null
    try {
      testCategoryResult = forumDataStore.createCategory({
        name: "Test Category",
        description: "Test category for debugging",
        color: "#FF0000",
        icon: "TestIcon",
      })
    } catch (error) {
      testCategoryResult = { error: error instanceof Error ? error.message : "Unknown error" }
    }

    const debugInfo = {
      timestamp: new Date().toISOString(),
      dataStoreState: {
        categories: {
          count: Array.isArray(categories) ? categories.length : 0,
          isArray: Array.isArray(categories),
          data: categories,
        },
        posts: {
          count: Array.isArray(posts) ? posts.length : 0,
          isArray: Array.isArray(posts),
          data: posts,
        },
        users: {
          count: Array.isArray(users) ? users.length : 0,
          isArray: Array.isArray(users),
          data: users.map((u) => ({
            id: u.id,
            username: u.username || u.name,
            role: u.role,
            email: u.email,
          })),
        },
        settings: settings,
      },
      testOperations: {
        categoryCreation: testCategoryResult,
      },
      systemChecks: {
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
        timestamp: Date.now(),
      },
    }

    console.log("📊 Debug info:", JSON.stringify(debugInfo, null, 2))

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
        stack: error instanceof Error ? error.stack : "No stack trace",
      },
      { status: 500 },
    )
  }
}

export async function POST() {
  try {
    console.log("🔧 Debug: Initializing test data")

    // Create test categories if none exist
    const categories = forumDataStore.getCategories()
    if (!Array.isArray(categories) || categories.length === 0) {
      console.log("📂 Creating test categories...")

      const testCategories = [
        {
          name: "General Discussion",
          description: "General topics and conversations",
          color: "#3B82F6",
          icon: "MessageSquare",
        },
        {
          name: "Help & Support",
          description: "Get help with your questions",
          color: "#10B981",
          icon: "HelpCircle",
        },
        {
          name: "Feature Requests",
          description: "Suggest new features and improvements",
          color: "#F59E0B",
          icon: "Lightbulb",
        },
      ]

      const createdCategories = []
      for (const categoryData of testCategories) {
        try {
          const newCategory = forumDataStore.createCategory(categoryData)
          createdCategories.push(newCategory)
          console.log(`✅ Created category: ${newCategory.name}`)
        } catch (error) {
          console.error(`❌ Failed to create category ${categoryData.name}:`, error)
        }
      }

      return NextResponse.json({
        success: true,
        message: "Test data initialized",
        data: {
          categoriesCreated: createdCategories.length,
          categories: createdCategories,
        },
      })
    } else {
      return NextResponse.json({
        success: true,
        message: "Categories already exist",
        data: {
          existingCategories: categories.length,
          categories: categories,
        },
      })
    }
  } catch (error) {
    console.error("❌ Debug POST error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to initialize test data",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
