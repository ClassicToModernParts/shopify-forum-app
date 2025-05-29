import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Forum stats API called")

    // Get stats from the data store
    const stats = forumDataStore.getStats()
    console.log("📊 Stats retrieved:", stats)

    // Ensure we have valid data structure
    const forumData = {
      totalPosts: stats.totalPosts || 0,
      totalUsers: stats.totalUsers || 0,
      totalCategories: stats.totalCategories || 0,
      onlineUsers: stats.activeToday || 0,
      categories: [],
      ...stats,
    }

    console.log("✅ Forum stats response:", forumData)

    return NextResponse.json({
      success: true,
      data: forumData,
      message: "Forum stats retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Forum stats API error:", error)

    // Return default data instead of error
    const defaultStats = {
      totalPosts: 0,
      totalUsers: 0,
      totalCategories: 0,
      onlineUsers: 0,
      activeToday: 0,
      postsThisMonth: 0,
      newUsersThisMonth: 0,
      topCategories: [],
      recentActivity: [],
    }

    return NextResponse.json({
      success: true,
      data: defaultStats,
      message: "Forum stats retrieved (default values)",
    })
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: "Method not allowed",
    },
    { status: 405 },
  )
}
