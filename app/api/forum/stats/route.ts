import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const shopId = searchParams.get("shop_id")

  if (!shopId) {
    return NextResponse.json({ error: "Shop ID required" }, { status: 400 })
  }

  // Mock statistics - in a real app, query your database
  const stats = {
    totalPosts: 127,
    totalUsers: 45,
    totalCategories: 5,
    activeToday: 12,
    postsThisMonth: 23,
    newUsersThisMonth: 8,
    topCategories: [
      { name: "Product Support", posts: 45 },
      { name: "General Discussion", posts: 32 },
      { name: "Feature Requests", posts: 28 },
    ],
    recentActivity: [
      {
        type: "post",
        title: "New product discussion",
        author: "customer@example.com",
        timestamp: new Date().toISOString(),
      },
      {
        type: "reply",
        title: "Shipping question",
        author: "user@example.com",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
  }

  return NextResponse.json({
    success: true,
    data: stats,
    message: "Forum statistics retrieved successfully",
  })
}
