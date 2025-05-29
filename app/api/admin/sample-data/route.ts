import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../../forum/data-store"

export async function DELETE(request: NextRequest) {
  try {
    console.log("🏛️ Admin Sample Data DELETE request")

    const cleared = forumDataStore.clearSampleData()

    if (!cleared) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to clear sample data",
          data: null,
        },
        { status: 500 },
      )
    }

    console.log("✅ Sample data cleared successfully")

    return NextResponse.json({
      success: true,
      data: { cleared: true },
      message: "Sample data cleared successfully",
    })
  } catch (error) {
    console.error("❌ Error clearing sample data:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to clear sample data: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}
