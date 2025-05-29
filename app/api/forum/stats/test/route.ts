import { NextResponse } from "next/server"
import { forumDataStore } from "../../data-store"

export async function GET() {
  try {
    console.log("🧪 Testing stats API")

    // Get statistics from the data store
    const stats = forumDataStore.getStats()

    console.log("🧪 Stats test result:", stats)

    return NextResponse.json({
      success: true,
      data: stats,
      message: "Stats test successful",
    })
  } catch (error) {
    console.error("❌ Stats test error:", error)

    return NextResponse.json(
      {
        success: false,
        error: `Stats test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 200 },
    ) // Return 200 with error in payload
  }
}
