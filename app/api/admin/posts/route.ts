import { type NextRequest, NextResponse } from "next/server"

// Mock data store - in production, this would be your database
let mockPosts = [
  {
    id: "1",
    title: "Welcome to Our Community Forum! 🎉",
    content:
      "We're excited to launch our new community forum where you can connect with other customers, get support, and share your experiences with our products.",
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
    content:
      "Here are some tips for maintaining your product to ensure it lasts for years to come. Regular maintenance will help extend the life of your purchase and ensure optimal performance.",
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
  {
    id: "3",
    title: "Product troubleshooting guide",
    content:
      "If you're experiencing issues with your product, here are some common solutions that might help resolve the problem quickly.",
    author: "Mike Chen",
    authorEmail: "mike@example.com",
    categoryId: "2",
    createdAt: "2024-01-15T09:15:00Z",
    updatedAt: "2024-01-15T09:15:00Z",
    replies: 8,
    views: 156,
    likes: 12,
    isPinned: false,
    isLocked: false,
    tags: ["troubleshooting", "help"],
    attachments: [],
    status: "active",
  },
  {
    id: "4",
    title: "Feature request: Dark mode",
    content:
      "Would love to see a dark mode option for the forum interface. It would be great for late-night browsing and easier on the eyes!",
    author: "Emma Wilson",
    authorEmail: "emma@example.com",
    categoryId: "3",
    createdAt: "2024-01-18T16:45:00Z",
    updatedAt: "2024-01-18T16:45:00Z",
    replies: 15,
    views: 203,
    likes: 25,
    isPinned: false,
    isLocked: false,
    tags: ["feature-request", "ui"],
    attachments: [],
    status: "active",
  },
  {
    id: "5",
    title: "Shipping and delivery questions",
    content:
      "I have some questions about shipping times and delivery options. Can someone from the team help clarify the different shipping methods available?",
    author: "David Lee",
    authorEmail: "david@example.com",
    categoryId: "1",
    createdAt: "2024-01-20T11:20:00Z",
    updatedAt: "2024-01-20T11:20:00Z",
    replies: 3,
    views: 67,
    likes: 4,
    isPinned: false,
    isLocked: false,
    tags: ["shipping", "delivery", "support"],
    attachments: [],
    status: "active",
  },
]

// GET - Retrieve posts (for admin viewing)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status") // active, hidden, all
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")
    const search = url.searchParams.get("search") || ""

    let filteredPosts = mockPosts

    // Filter by status if specified
    if (status && status !== "all") {
      filteredPosts = filteredPosts.filter((post) => post.status === status)
    }

    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase()
      filteredPosts = filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.author.toLowerCase().includes(searchLower),
      )
    }

    // Sort by creation date (newest first)
    filteredPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination
    const paginatedPosts = filteredPosts.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      total: filteredPosts.length,
      offset,
      limit,
      message: `Retrieved ${paginatedPosts.length} posts`,
    })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch posts" }, { status: 500 })
  }
}

// DELETE - Delete single post or bulk delete
export async function DELETE(request: NextRequest) {
  try {
    const { postId, postIds } = await request.json()

    if (postIds && Array.isArray(postIds)) {
      // Bulk delete
      const initialLength = mockPosts.length
      const postsToDelete = mockPosts.filter((post) => postIds.includes(post.id))
      mockPosts = mockPosts.filter((post) => !postIds.includes(post.id))
      const deletedCount = initialLength - mockPosts.length

      console.log(
        `Admin bulk deleted ${deletedCount} posts:`,
        postsToDelete.map((p) => p.title),
      )

      return NextResponse.json({
        success: true,
        message: `${deletedCount} posts deleted successfully`,
        deletedCount,
        deletedPosts: postsToDelete,
      })
    } else if (postId) {
      // Single delete
      const postIndex = mockPosts.findIndex((post) => post.id === postId)
      if (postIndex === -1) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
      }

      const deletedPost = mockPosts.splice(postIndex, 1)[0]
      console.log(`Admin deleted post: ${deletedPost.title}`)

      return NextResponse.json({
        success: true,
        message: "Post deleted successfully",
        deletedPost,
      })
    }

    return NextResponse.json({ success: false, error: "Post ID or IDs required" }, { status: 400 })
  } catch (error) {
    console.error("Error deleting post:", error)
    return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 })
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
