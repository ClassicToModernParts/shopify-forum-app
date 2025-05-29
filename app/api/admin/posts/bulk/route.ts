import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../../../forum/data-store"

export async function DELETE(request: NextRequest) {
  try {
    console.log("🏛️ Admin Posts Bulk DELETE request")
    const body = await request.json()
    console.log("📝 Bulk deletion data:", body)

    const { postIds } = body

    if (!Array.isArray(postIds) || postIds.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Post IDs array is required",
          data: null,
        },
        { status: 400 },
      )
    }

    let deletedCount = 0
    const failedDeletes: string[] = []

    for (const postId of postIds) {
      const deleted = forumDataStore.adminDeletePost(postId)
      if (deleted) {
        deletedCount++
      } else {
        failedDeletes.push(postId)
      }
    }

    console.log(`✅ Bulk deleted ${deletedCount} posts, ${failedDeletes.length} failed`)

    return NextResponse.json({
      success: true,
      data: {
        deletedCount,
        failedDeletes,
        totalRequested: postIds.length,
      },
      message: `Successfully deleted ${deletedCount} posts`,
    })
  } catch (error) {
    console.error("❌ Error bulk deleting posts:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to bulk delete posts: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}
