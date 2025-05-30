import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    if (type === "settings") {
      const settings = await persistentForumDataStore.getRewardsSettings()
      return NextResponse.json({
        success: true,
        data: settings,
        message: "Rewards settings retrieved successfully",
      })
    } else if (type === "leaderboard") {
      const limit = Number.parseInt(searchParams.get("limit") || "10")
      const leaderboard = await persistentForumDataStore.getRewardsLeaderboard(limit)
      return NextResponse.json({
        success: true,
        data: leaderboard,
        message: "Rewards leaderboard retrieved successfully",
      })
    } else if (type === "user-rewards") {
      const userId = searchParams.get("user_id")
      if (!userId) {
        return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
      }
      const userRewards = await persistentForumDataStore.getUserRewards(userId)
      return NextResponse.json({
        success: true,
        data: userRewards,
        message: "User rewards retrieved successfully",
      })
    } else {
      // Get all user rewards
      const allRewards = await persistentForumDataStore.getAllUserRewards()
      return NextResponse.json({
        success: true,
        data: allRewards,
        message: "All user rewards retrieved successfully",
      })
    }
  } catch (error) {
    console.error("❌ Error in rewards API GET:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to retrieve rewards data: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type } = body

    if (type === "update-settings") {
      const { settings } = body
      if (!settings) {
        return NextResponse.json({ success: false, error: "Settings data is required" }, { status: 400 })
      }

      const updatedSettings = await persistentForumDataStore.updateRewardsSettings(settings)
      return NextResponse.json({
        success: true,
        data: updatedSettings,
        message: "Rewards settings updated successfully",
      })
    } else if (type === "award-points") {
      const { userId, points, reason, actionType } = body
      if (!userId || points === undefined) {
        return NextResponse.json({ success: false, error: "User ID and points are required" }, { status: 400 })
      }

      const result = await persistentForumDataStore.awardPoints(userId, points, reason, actionType)
      return NextResponse.json({
        success: true,
        data: result,
        message: "Points awarded successfully",
      })
    } else if (type === "redeem-coupon") {
      const { userId, couponType } = body
      if (!userId || !couponType) {
        return NextResponse.json({ success: false, error: "User ID and coupon type are required" }, { status: 400 })
      }

      const result = await persistentForumDataStore.redeemCoupon(userId, couponType)
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 })
      }

      return NextResponse.json({
        success: true,
        data: result.data,
        message: "Coupon redeemed successfully",
      })
    } else {
      return NextResponse.json({ success: false, error: "Invalid request type" }, { status: 400 })
    }
  } catch (error) {
    console.error("❌ Error in rewards API POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to process rewards request: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
