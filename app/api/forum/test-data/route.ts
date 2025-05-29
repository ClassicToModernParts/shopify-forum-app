import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function GET(request: NextRequest) {
  try {
    console.log("📊 Forum test data API called")

    // Get all data from the store
    const categories = forumDataStore.getCategories(true)
    const posts = forumDataStore.getPosts()

    // Get replies (this is a private property, so we'll use a workaround)
    let replies: any[] = []
    try {
      // @ts-ignore - accessing private property for debugging
      replies = forumDataStore.replies || []
    } catch (error) {
      console.error("❌ Could not access replies:", error)
    }

    return NextResponse.json({
      success: true,
      data: {
        categories,
        posts,
        replies,
      },
      message: "Forum test data retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Forum test data API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
