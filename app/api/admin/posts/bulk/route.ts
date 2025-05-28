import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest) {
  try {
    const { postIds } = await request.json()

    if (!postIds || !Array.isArray(postIds)) {
      return NextResponse.json(
        {
          success: false,
          error: "Post IDs array is required",
        },
        { status: 400 },
      )
    }

    // In a real app, delete multiple posts from database
    console.log(`Admin bulk deleted posts: ${postIds.join(", ")}`)

    return NextResponse.json({
      success: true,
      message: `${postIds.length} posts deleted successfully`,
    })
  } catch (error) {
    console.error("Error bulk deleting posts:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete posts",
      },
      { status: 500 },
    )
  }
}
