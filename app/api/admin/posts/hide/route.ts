import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { postId } = await request.json()

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          error: "Post ID is required",
        },
        { status: 400 },
      )
    }

    // In a real app, toggle visibility in database
    console.log(`Admin toggled visibility for post: ${postId}`)

    return NextResponse.json({
      success: true,
      message: "Post visibility updated",
    })
  } catch (error) {
    console.error("Error toggling post visibility:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update post visibility",
      },
      { status: 500 },
    )
  }
}
