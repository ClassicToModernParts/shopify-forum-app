import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shopId = searchParams.get("shop_id")

  if (!shopId) {
    return NextResponse.json({ error: "Shop ID required" }, { status: 400 })
  }

  try {
    // Get real statistics from the data store
    const stats = forumDataStore.getStats()

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Forum statistics retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching forum stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch forum statistics",
        data: {
          totalPosts: 0,
          totalUsers: 0,
          totalCategories: 0,
          activeToday: 0,
          postsThisMonth: 0,
          newUsersThisMonth: 0,
          topCategories: [],
          recentActivity: [],
        },
      },
      { status: 500 },
    )
  }
}
