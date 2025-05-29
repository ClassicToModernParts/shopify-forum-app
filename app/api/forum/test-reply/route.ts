import { type NextRequest, NextResponse } from "next/server"
import { forumDataStore } from "../data-store"

export async function POST(request: NextRequest) {
  try {
    console.log("🧪 Testing reply creation...")

    // First, let's check if we have any posts
    const posts = forumDataStore.getPosts()
    console.log(`📊 Found ${posts.length} posts for testing`)

    if (posts.length === 0) {
      // Create a test post first
      console.log("📝 Creating test post for reply testing...")

      const categories = forumDataStore.getCategories()
      if (categories.length === 0) {
        // Create a test category first
        const testCategory = forumDataStore.createCategory({
          name: "Test Category",
          description: "Test category for reply testing",
          color: "#3B82F6",
          icon: "MessageSquare",
        })
        console.log("✅ Test category created:", testCategory.id)
      }

      const testPost = forumDataStore.createPost({
        title: "Test Post for Replies",
        content: "This is a test post to test reply functionality.",
        author: "Test User",
        authorEmail: "test@example.com",
        categoryId: categories[0]?.id || forumDataStore.getCategories()[0].id,
        tags: ["test"],
      })
      console.log("✅ Test post created:", testPost.id)
    }

    // Now test creating a reply
    const testPostId = posts[0]?.id || forumDataStore.getPosts()[0].id
    console.log(`💬 Testing reply creation for post: ${testPostId}`)

    const testReplyData = {
      postId: testPostId,
      content: "This is a test reply to verify reply functionality works correctly.",
      author: "Test Reply User",
      authorEmail: "testreply@example.com",
    }

    console.log("🔍 Reply data:", testReplyData)

    const newReply = forumDataStore.addReply(testReplyData)

    if (!newReply) {
      throw new Error("addReply returned null/undefined")
    }

    console.log("✅ Test reply created successfully:", newReply)

    // Verify the reply was added
    const replies = forumDataStore.getRepliesByPostId(testPostId)
    console.log(`📊 Post now has ${replies.length} replies`)

    // Check if post reply count was updated
    const updatedPost = forumDataStore.getPostById(testPostId)
    console.log(`📊 Post reply count: ${updatedPost?.replies}`)

    return NextResponse.json({
      success: true,
      message: "Reply test completed successfully",
      data: {
        reply: newReply,
        postReplies: replies.length,
        postReplyCount: updatedPost?.replies,
      },
    })
  } catch (error) {
    console.error("❌ Reply test failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Reply test failed",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : "No details available",
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Getting reply test info...")

    const posts = forumDataStore.getPosts()
    const allReplies = []

    for (const post of posts) {
      const postReplies = forumDataStore.getRepliesByPostId(post.id)
      allReplies.push({
        postId: post.id,
        postTitle: post.title,
        replyCount: postReplies.length,
        replies: postReplies,
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        totalPosts: posts.length,
        postsWithReplies: allReplies.filter((p) => p.replyCount > 0).length,
        allReplies: allReplies,
      },
    })
  } catch (error) {
    console.error("❌ Error getting reply test info:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get reply test info",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
