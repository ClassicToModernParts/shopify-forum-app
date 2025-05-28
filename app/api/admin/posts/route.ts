import { type NextRequest, NextResponse } from "next/server"

// Mock data store - in production, this would be your database
let mockPosts = [
  {
    id: "1",
    title: "Welcome to Our Community Forum! 🎉",
    content: "We're excited to launch our new community forum where you can connect with other customers, get support, and share your experiences with our products.",
    author: "Store Admin",
    authorEmail: "admin@store.com",
    categoryId: "1",
    createdAt: "2024-01-10T12:00:00Z",
    updatedAt: "2024-01-10T12:00:00Z",
    replies: 12,
    views: 245,
    likes: 18,
    isPinned: true,
    isLocked: false,
    tags: ["announcement", "welcome"],
    attachments: [],
    status: "active",
  },
  {
    id: "2",
    title: "How to care for your new product",
    content: "Here are some tips for maintaining your product to ensure it lasts for years to come.",
    author: "Sarah Johnson",
    authorEmail: "sarah@example.com",
    categoryId: "2",
    createdAt: "2024-01-12T14:30:00Z",
    updatedAt: "2024-01-12T14:30:00Z",
    replies: 5,
    views: 89,
    likes: 7,
    isPinned: false,
    isLocked: false,
    tags: ["care", "maintenance", "tips"],
    attachments: ["care-guide.pdf"],
    status: "active",
  },
]

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      data: mockPosts,
      message: "Posts retrieved successfully",
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { postId, postIds } = await request.json()

    if (postIds && Array.isArray(postIds)) {
      // Bulk delete
      const initialLength = mockPosts.length
      mockPosts = mockPosts.filter((post) => !postIds.includes(post.id))
      const deletedCount = initialLength - mockPosts.length

      return NextResponse.json({
        success: true,
        message: `${deletedCount} posts deleted successfully`,
      })
    } else if (postId) {
      // Single delete
      const postIndex = mockPosts.findIndex((post) => post.id === postId)
      if (postIndex === -1) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
      }

      mockPosts.splice(postIndex, 1)
      return NextResponse.json({
        success: true,
        message: "Post deleted successfully",
      })
    }

    return NextResponse.json({ success: false, error: "Post ID or IDs required" }, { status: 400 })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, postId } = await request.json()

    const post = mockPosts.find((p) => p.id === postId)
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    switch (action) {
      case "pin":
        post.isPinned = !post.isPinned
        return NextResponse.json({
          success: true,
          message: `Post ${post.isPinned ? "pinned" : "unpinned"} successfully`,
        })
      case "lock":
        post.isLocked = !post.isLocked
        return NextResponse.json({
          success: true,
          message: `Post ${post.isLocked ? "locked" : "unlocked"} successfully`,
        })
      case "hide":
        post.status = post.status === "active" ? "hidden" : "active"
        return NextResponse.json({
          success: true,
          message: `Post ${post.status === "hidden" ? "hidden" : "shown"} successfully`,
        })
      default:
        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error performing action:", error)
    return NextResponse.json({ success: false, error: "Failed to perform action" }, { status: 500 })
  }
}
