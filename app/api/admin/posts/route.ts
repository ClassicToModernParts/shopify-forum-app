import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../../forum/data-store"

// Mock posts data (replace with your actual data source)
const mockPosts = [
  {
    id: "1",
    title: "First Post",
    content: "This is the first post.",
    author: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
    isLocked: false,
    status: "active",
  },
  {
    id: "2",
    title: "Second Post",
    content: "This is the second post.",
    author: "Admin",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    isPinned: false,
    isLocked: false,
    status: "active",
  },
]

export async function GET(request: NextRequest) {
  try {
    console.log("🏛️ Admin Posts GET request")

    // Wait for data store to be initialized
    await new Promise((resolve) => setTimeout(resolve, 100))

    const posts = forumDataStore.getPosts()
    console.log("📊 Raw posts from store:", posts.length)

    // Ensure we return an array
    const postsArray = Array.isArray(posts) ? posts : []
    console.log("📋 Posts array to return:", postsArray.length)

    return NextResponse.json({
      success: true,
      data: postsArray,
      message: "Posts retrieved successfully",
    })
  } catch (error) {
    console.error("❌ Error fetching posts:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to fetch posts: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: [], // Always return empty array on error
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log("🏛️ Admin Posts DELETE request")
    const body = await request.json()
    console.log("📝 Post deletion data:", body)

    const { postId, forceDelete } = body

    if (!postId) {
      return NextResponse.json(
        {
          success: false,
          error: "Post ID is required",
          data: null,
        },
        { status: 400 },
      )
    }

    // For admin, we can force delete any post
    const deleted = forumDataStore.adminDeletePost(postId)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Post not found or could not be deleted",
          data: null,
        },
        { status: 404 },
      )
    }

    console.log("✅ Post deleted by admin:", postId)

    return NextResponse.json({
      success: true,
      data: { deleted: true, postId },
      message: "Post deleted successfully",
    })
  } catch (error) {
    console.error("❌ Error deleting post:", error)
    return NextResponse.json(
      {
        success: false,
        error: `Failed to delete post: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}

// PUT - Update post
export async function PUT(request: NextRequest) {
  try {
    const { postId, updates } = await request.json()

    if (!postId) {
      return NextResponse.json({ success: false, error: "Post ID is required" }, { status: 400 })
    }

    const postIndex = mockPosts.findIndex((post) => post.id === postId)
    if (postIndex === -1) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const originalPost = { ...mockPosts[postIndex] }

    // Update the post
    mockPosts[postIndex] = {
      ...mockPosts[postIndex],
      ...updates,
      updatedAt: new Date().toISOString(),
    }

    console.log(`Admin updated post: ${originalPost.title} -> ${mockPosts[postIndex].title}`)

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      data: mockPosts[postIndex],
      originalData: originalPost,
    })
  } catch (error) {
    console.error("Error updating post:", error)
    return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 })
  }
}

// POST - Perform actions on posts (pin, lock, hide, etc.)
export async function POST(request: NextRequest) {
  try {
    const { action, postId, postIds, updates } = await request.json()

    switch (action) {
      case "pin":
        const postToPin = mockPosts.find((post) => post.id === postId)
        if (postToPin) {
          postToPin.isPinned = !postToPin.isPinned
          postToPin.updatedAt = new Date().toISOString()
          console.log(`Admin ${postToPin.isPinned ? "pinned" : "unpinned"} post: ${postToPin.title}`)
          return NextResponse.json({
            success: true,
            message: `Post ${postToPin.isPinned ? "pinned" : "unpinned"} successfully`,
            data: { isPinned: postToPin.isPinned },
          })
        }
        break

      case "lock":
        const postToLock = mockPosts.find((post) => post.id === postId)
        if (postToLock) {
          postToLock.isLocked = !postToLock.isLocked
          postToLock.updatedAt = new Date().toISOString()
          console.log(`Admin ${postToLock.isLocked ? "locked" : "unlocked"} post: ${postToLock.title}`)
          return NextResponse.json({
            success: true,
            message: `Post ${postToLock.isLocked ? "locked" : "unlocked"} successfully`,
            data: { isLocked: postToLock.isLocked },
          })
        }
        break

      case "hide":
        const postToHide = mockPosts.find((post) => post.id === postId)
        if (postToHide) {
          postToHide.status = postToHide.status === "active" ? "hidden" : "active"
          postToHide.updatedAt = new Date().toISOString()
          console.log(`Admin ${postToHide.status === "hidden" ? "hid" : "showed"} post: ${postToHide.title}`)
          return NextResponse.json({
            success: true,
            message: `Post ${postToHide.status === "hidden" ? "hidden" : "shown"} successfully`,
            data: { status: postToHide.status },
          })
        }
        break

      default:
        return NextResponse.json({ success: false, error: `Invalid action: ${action}` }, { status: 400 })
    }

    return NextResponse.json({ success: false, error: "Invalid action or post not found" }, { status: 400 })
  } catch (error) {
    console.error("Error performing post action:", error)
    return NextResponse.json({ success: false, error: "Failed to perform action" }, { status: 500 })
  }
}
