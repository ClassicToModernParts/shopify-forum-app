import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "../../forum/persistent-store"

export async function POST(request: NextRequest) {
  try {
    console.log("🔄 Admin reset-forum POST request received")

    // For extreme security, let's check for an admin token
    const authorization = request.headers.get("Authorization") || ""
    const token = authorization.replace("Bearer ", "")

    // In a production system, we'd validate this token properly
    // For now, we'll require a specific parameter as an additional security measure
    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get("confirm")

    if (confirm !== "yes-reset-forum-fully") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing confirmation parameter",
        },
        { status: 400 },
      )
    }

    // Clear all forum data and reinitialize
    await persistentForumDataStore.clearAllData()
    await persistentForumDataStore.forceReinitialize()

    return NextResponse.json({
      success: true,
      message: "Forum data has been reset and reinitialized",
    })
  } catch (error) {
    console.error("❌ Error resetting forum:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error resetting forum: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Admin reset-forum GET request received")

    // Get the current forum data state
    const data = await persistentForumDataStore.getAllDataWithDeleted()

    return NextResponse.json({
      success: true,
      data,
      message: "Current forum data state retrieved",
    })
  } catch (error) {
    console.error("❌ Error getting forum data state:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Error getting forum data state: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
