import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../../../api/forum/data-store"

// GET - Retrieve posts (for admin viewing)
export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url)
    const status = url.searchParams.get("status") // active, hidden, deleted, all
    const limit = Number.parseInt(url.searchParams.get("limit") || "50")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")
    const search = url.searchParams.get("search") || ""

    // Get all posts including deleted ones for admin
    let allPosts = forumDataStore.getAllDataWithDeleted().posts

    // Filter by status if specified
    if (status && status !== "all") {
      allPosts = allPosts.filter((post) => post.status === status)
    }

    // Filter by search term if specified
    if (search) {
      const searchLower = search.toLowerCase()
      allPosts = allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchLower) ||
          post.content.toLowerCase().includes(searchLower) ||
          post.author.toLowerCase().includes(searchLower),
      )
    }

    // Sort by creation date (newest first)
    allPosts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    // Apply pagination
    const paginatedPosts = allPosts.slice(offset, offset + limit)

    return NextResponse.json({
      success: true,
      data: paginatedPosts,
      total: allPosts.length,
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
      const deletedPosts = []
      let deletedCount = 0

      for (const id of postIds) {
        const post = forumDataStore.getPostById(id)
        if (post) {
          const success = forumDataStore.adminDeletePost(id)
          if (success) {
            deletedPosts.push(post)
            deletedCount++
          }
        }
      }

      console.log(
        `Admin bulk deleted ${deletedCount} posts:`,
        deletedPosts.map((p) => p.title),
      )

      return NextResponse.json({
        success: true,
        message: `${deletedCount} posts deleted successfully`,
        deletedCount,
        deletedPosts,
      })
    } else if (postId) {
      // Single delete
      const post = forumDataStore.getPostById(postId)
      if (!post) {
        return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
      }

      const success = forumDataStore.adminDeletePost(postId)
      if (!success) {
        return NextResponse.json({ success: false, error: "Failed to delete post" }, { status: 500 })
      }

      console.log(`Admin deleted post: ${post.title}`)

      return NextResponse.json({
        success: true,
        message: "Post deleted successfully",
        deletedPost: post,
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

    const post = forumDataStore.getPostById(postId)
    if (!post) {
      return NextResponse.json({ success: false, error: "Post not found" }, { status: 404 })
    }

    const updatedPost = forumDataStore.updatePost(postId, updates)
    if (!updatedPost) {
      return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 })
    }

    console.log(`Admin updated post: ${post.title} -> ${updatedPost.title}`)

    return NextResponse.json({
      success: true,
      message: "Post updated successfully",
      data: updatedPost,
      originalData: post,
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
        const postToPin = forumDataStore.getPostById(postId)
        if (postToPin) {
          const isPinned = !postToPin.isPinned
          const updatedPost = forumDataStore.updatePost(postId, { isPinned })
          if (!updatedPost) {
            return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 })
          }
          console.log(`Admin ${isPinned ? "pinned" : "unpinned"} post: ${postToPin.title}`)
          return NextResponse.json({
            success: true,
            message: `Post ${isPinned ? "pinned" : "unpinned"} successfully`,
            data: { isPinned },
          })
        }
        break

      case "lock":
        const postToLock = forumDataStore.getPostById(postId)
        if (postToLock) {
          const isLocked = !postToLock.isLocked
          const updatedPost = forumDataStore.updatePost(postId, { isLocked })
          if (!updatedPost) {
            return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 })
          }
          console.log(`Admin ${isLocked ? "locked" : "unlocked"} post: ${postToLock.title}`)
          return NextResponse.json({
            success: true,
            message: `Post ${isLocked ? "locked" : "unlocked"} successfully`,
            data: { isLocked },
          })
        }
        break

      case "hide":
        const postToHide = forumDataStore.getPostById(postId)
        if (postToHide) {
          const status = postToHide.status === "active" ? "hidden" : "active"
          const updatedPost = forumDataStore.updatePost(postId, { status })
          if (!updatedPost) {
            return NextResponse.json({ success: false, error: "Failed to update post" }, { status: 500 })
          }
          console.log(`Admin ${status === "hidden" ? "hid" : "showed"} post: ${postToHide.title}`)
          return NextResponse.json({
            success: true,
            message: `Post ${status === "hidden" ? "hidden" : "shown"} successfully`,
            data: { status },
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
