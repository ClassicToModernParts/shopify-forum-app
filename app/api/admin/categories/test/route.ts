import { NextResponse } from "next/server"
import { forumDataStore } from "../../../forum/data-store"

export async function GET() {
  try {
    console.log("🧪 Testing categories data store...")

    // Test basic functionality
    const debugInfo = await forumDataStore.getDebugInfo()
    console.log("🔍 Debug info:", debugInfo)

    const categories = forumDataStore.getCategories()
    console.log("📊 Categories test result:", categories)

    return NextResponse.json({
      success: true,
      data: {
        debugInfo,
        categories,
        categoriesCount: Array.isArray(categories) ? categories.length : 0,
        categoriesType: typeof categories,
        isArray: Array.isArray(categories),
      },
      message: "Categories test completed",
    })
  } catch (error) {
    console.error("❌ Categories test error:", error)
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
