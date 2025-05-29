import { NextResponse } from "next/server"
import { forumDataStore } from "../../forum/data-store"

export async function POST() {
  try {
    console.log("🚀 Initializing admin data...")

    // Add some default categories if none exist
    const existingCategories = forumDataStore.getCategories()

    if (!Array.isArray(existingCategories) || existingCategories.length === 0) {
      console.log("📝 Creating default categories...")

      const defaultCategories = [
        {
          name: "General Discussion",
          description: "General topics and discussions",
          color: "#3B82F6",
        },
        {
          name: "Help & Support",
          description: "Get help with your questions",
          color: "#10B981",
        },
        {
          name: "Announcements",
          description: "Important announcements and updates",
          color: "#F59E0B",
        },
      ]

      for (const category of defaultCategories) {
        forumDataStore.addCategory(category)
      }

      console.log("✅ Default categories created")
    }

    const finalCategories = forumDataStore.getCategories()

    return NextResponse.json({
      success: true,
      data: {
        categoriesCreated: finalCategories.length,
        categories: finalCategories,
      },
      message: "Admin data initialized successfully",
    })
  } catch (error) {
    console.error("❌ Init error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
