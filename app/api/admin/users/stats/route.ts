import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Admin user stats API: GET request")

    const users = await persistentForumDataStore.getUsers()
    const posts = await persistentForumDataStore.getPosts()

    // Calculate user stats
    const totalUsers = users.length
    const activeUsers = users.filter((user) => user.isActive !== false).length
    const inactiveUsers = totalUsers - activeUsers

    const usersByRole = {
      admin: users.filter((user) => user.role === "admin").length,
      moderator: users.filter((user) => user.role === "moderator").length,
      user: users.filter((user) => user.role === "user").length,
    }

    // Calculate activity stats (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const recentlyActive = users.filter((user) => user.lastActive && new Date(user.lastActive) > thirtyDaysAgo).length

    // Calculate user engagement
    const usersWithPosts = new Set(posts.map((post) => post.authorEmail)).size
    const engagementRate = totalUsers > 0 ? ((usersWithPosts / totalUsers) * 100).toFixed(1) : "0"

    // Recent registrations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    const recentRegistrations = users.filter((user) => new Date(user.createdAt) > sevenDaysAgo).length

    const stats = {
      totalUsers,
      activeUsers,
      inactiveUsers,
      usersByRole,
      recentlyActive,
      recentRegistrations,
      engagementRate: Number.parseFloat(engagementRate),
      averagePostsPerUser: totalUsers > 0 ? (posts.length / totalUsers).toFixed(2) : "0",
    }

    console.log("✅ User stats calculated")

    return NextResponse.json({
      success: true,
      data: stats,
    })
  } catch (error) {
    console.error("❌ Error fetching user stats:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user statistics",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
