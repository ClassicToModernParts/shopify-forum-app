import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "@/lib/persistent-data-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type")

    console.log("🎁 Rewards API GET request, type:", type)

    if (type === "settings") {
      try {
        const settings = await persistentForumDataStore.getRewardsSettings()
        console.log("✅ Rewards settings retrieved:", settings)
        return NextResponse.json({
          success: true,
          data: settings,
          message: "Rewards settings retrieved successfully",
        })
      } catch (error) {
        console.error("❌ Error getting rewards settings:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to get rewards settings: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } else if (type === "leaderboard") {
      try {
        const limit = Number.parseInt(searchParams.get("limit") || "10")
        const leaderboard = await persistentForumDataStore.getRewardsLeaderboard(limit)
        console.log("✅ Rewards leaderboard retrieved:", leaderboard.length, "entries")
        return NextResponse.json({
          success: true,
          data: leaderboard,
          message: "Rewards leaderboard retrieved successfully",
        })
      } catch (error) {
        console.error("❌ Error getting rewards leaderboard:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to get rewards leaderboard: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } else if (type === "user-rewards") {
      try {
        const userId = searchParams.get("user_id")
        if (!userId) {
          return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 })
        }
        const userRewards = await persistentForumDataStore.getUserRewards(userId)
        console.log("✅ User rewards retrieved for:", userId)
        return NextResponse.json({
          success: true,
          data: userRewards,
          message: "User rewards retrieved successfully",
        })
      } catch (error) {
        console.error("❌ Error getting user rewards:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to get user rewards: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } else {
      // Get all user rewards
      try {
        const allRewards = await persistentForumDataStore.getAllUserRewards()
        console.log("✅ All user rewards retrieved:", allRewards.length, "users")
        return NextResponse.json({
          success: true,
          data: allRewards,
          message: "All user rewards retrieved successfully",
        })
      } catch (error) {
        console.error("❌ Error getting all user rewards:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to get all user rewards: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
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

    console.log("🎁 Rewards API POST request, type:", type)

    if (type === "update-settings") {
      try {
        const { settings } = body
        if (!settings) {
          return NextResponse.json({ success: false, error: "Settings data is required" }, { status: 400 })
        }

        console.log("💾 Updating rewards settings:", settings)
        const updatedSettings = await persistentForumDataStore.updateRewardsSettings(settings)
        console.log("✅ Rewards settings updated successfully")
        return NextResponse.json({
          success: true,
          data: updatedSettings,
          message: "Rewards settings updated successfully",
        })
      } catch (error) {
        console.error("❌ Error updating rewards settings:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to update rewards settings: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } else if (type === "award-points") {
      try {
        const { userId, points, reason, actionType } = body
        if (!userId || points === undefined) {
          return NextResponse.json({ success: false, error: "User ID and points are required" }, { status: 400 })
        }

        console.log("🏆 Awarding points:", { userId, points, reason, actionType })
        const result = await persistentForumDataStore.awardPoints(userId, points, reason, actionType)
        console.log("✅ Points awarded successfully")
        return NextResponse.json({
          success: true,
          data: result,
          message: "Points awarded successfully",
        })
      } catch (error) {
        console.error("❌ Error awarding points:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to award points: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
    } else if (type === "redeem-coupon") {
      try {
        const { userId, couponType } = body
        if (!userId || !couponType) {
          return NextResponse.json({ success: false, error: "User ID and coupon type are required" }, { status: 400 })
        }

        console.log("🎫 Redeeming coupon:", { userId, couponType })
        const result = await persistentForumDataStore.redeemCoupon(userId, couponType)
        if (!result.success) {
          return NextResponse.json({ success: false, error: result.error }, { status: 400 })
        }

        console.log("✅ Coupon redeemed successfully")
        return NextResponse.json({
          success: true,
          data: result.data,
          message: "Coupon redeemed successfully",
        })
      } catch (error) {
        console.error("❌ Error redeeming coupon:", error)
        return NextResponse.json(
          {
            success: false,
            error: `Failed to redeem coupon: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
          { status: 500 },
        )
      }
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
