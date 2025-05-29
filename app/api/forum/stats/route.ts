import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shopId = searchParams.get("shop_id")

  if (!shopId) {
    return NextResponse.json(
      {
        success: false,
        error: "Shop ID required",
        data: getDefaultStats(),
      },
      { status: 400 },
    )
  }

  try {
    console.log("📊 Getting forum stats for shop:", shopId)

    // Get statistics from the data store
    const stats = forumDataStore.getStats() || getDefaultStats()

    console.log("📊 Stats retrieved:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Forum statistics retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Error fetching forum stats:", error)

    // Return default stats with error
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch forum statistics: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: getDefaultStats(),
      },
      { status: 200 }, // Return 200 with error in payload instead of 500
    )
  }
}

// Default stats to use when real stats can't be retrieved
function getDefaultStats() {
  return {
    totalPosts: 0,
    totalUsers: 0,
    totalCategories: 0,
    activeToday: 0,
    postsThisMonth: 0,
    newUsersThisMonth: 0,
    topCategories: [],
    recentActivity: [],
  }
}
