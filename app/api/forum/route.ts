import { type NextRequest, NextResponse } from "next/server"
import { persistentForumDataStore } from "./persistent-store"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const requestType = searchParams.get("type")
    const shopId = searchParams.get("shop_id") || "demo"

    console.log(`🔍 Forum API GET request: ${requestType} for shop ${shopId}`)

    if (requestType === "categories") {
      const categories = await persistentForumDataStore.getCategories()
      console.log(`📋 Returning ${categories.length} categories`)

      // Add postCount and lastActivity for each category
      const posts = await persistentForumDataStore.getPosts()

      const categoriesWithMeta = categories.map((category) => {
        const categoryPosts = posts.filter((post) => post.categoryId === category.id)
        const lastPost = categoryPosts.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
        )[0]

        return {
          ...category,
          postCount: categoryPosts.length,
          lastActivity: lastPost ? lastPost.updatedAt : category.createdAt,
        }
      })

      return NextResponse.json({
        success: true,
        data: categoriesWithMeta,
        message: "Categories retrieved successfully",
      })
    } else if (requestType === "posts") {
      const categoryId = searchParams.get("category_id")
      const search = searchParams.get("search")
      const sortBy = searchParams.get("sort_by") || "recent"

      let posts = await persistentForumDataStore.getPosts()

      // Filter by category if specified
      if (categoryId) {
        posts = posts.filter((post) => post.categoryId === categoryId)
      }

      // Filter by search query if specified
      if (search) {
        const searchLower = search.toLowerCase()
        posts = posts.filter(
          (post) => post.title.toLowerCase().includes(searchLower) || post.content.toLowerCase().includes(searchLower),
        )
      }

      // Sort posts
      switch (sortBy) {
        case "popular":
          posts = posts.sort((a, b) => b.views + b.likes - (a.views + a.likes))
          break
        case "replies":
          posts = posts.sort((a, b) => b.replies - a.replies)
          break
        case "oldest":
          posts = posts.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
          break
        case "recent":
        default:
          posts = posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      }

      return NextResponse.json({
        success: true,
        data: posts,
        message: "Posts retrieved successfully",
      })
    } else if (requestType === "post") {
      const postId = searchParams.get("post_id")

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

      const post = await persistentForumDataStore.getPostById(postId)
      if (!post) {
        return NextResponse.json(
          {
            success: false,
            error: "Post not found",
            data: null,
          },
          { status: 404 },
        )
      }

      // Increment view count
      const updatedPost = await persistentForumDataStore.incrementPostViews(postId)

      return NextResponse.json({
        success: true,
        data: updatedPost || post,
        message: "Post retrieved successfully",
      })
    } else if (requestType === "replies") {
      const postId = searchParams.get("post_id")

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

      const replies = await persistentForumDataStore.getRepliesByPostId(postId)

      return NextResponse.json({
        success: true,
        data: replies,
        message: "Replies retrieved successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type",
          data: null,
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Error in forum API:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
        data: null,
      },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, shopId } = body

    console.log(`📝 Forum API POST request: ${type} for shop ${shopId}`)

    if (type === "create_post") {
      const { title, content, author, authorEmail, categoryId, tags } = body

      // Validate required fields
      if (!title || !content || !categoryId) {
        return NextResponse.json(
          {
            success: false,
            error: "Missing required fields",
            missingFields: {
              title: !title,
              content: !content,
              categoryId: !categoryId,
            },
          },
          { status: 400 },
        )
      }

      // Check if category exists
      const category = await persistentForumDataStore.getCategoryById(categoryId)
      if (!category) {
        const categories = await persistentForumDataStore.getCategories()
        return NextResponse.json(
          {
            success: false,
            error: `Category not found: ${categoryId}`,
            availableCategories: categories,
          },
          { status: 404 },
        )
      }

      const post = await persistentForumDataStore.createPost({
        title,
        content,
        author,
        authorEmail,
        categoryId,
        tags,
        status: "active",
      })

      return NextResponse.json({
        success: true,
        data: post,
        message: "Post created successfully",
      })
    } else if (type === "create_reply") {
      const { postId, content, author, authorEmail } = body

      if (!postId || !content) {
        return NextResponse.json(
          {
            success: false,
            error: "Post ID and content are required",
          },
          { status: 400 },
        )
      }

      // Check if post exists
      const post = await persistentForumDataStore.getPostById(postId)
      if (!post) {
        return NextResponse.json(
          {
            success: false,
            error: `Post not found: ${postId}`,
          },
          { status: 404 },
        )
      }

      const reply = await persistentForumDataStore.addReply({
        postId,
        content,
        author,
        authorEmail,
      })

      return NextResponse.json({
        success: true,
        data: reply,
        message: "Reply created successfully",
      })
    } else if (type === "like_post") {
      const { postId } = body

      if (!postId) {
        return NextResponse.json(
          {
            success: false,
            error: "Post ID is required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.likePost(postId)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Post not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "Post liked successfully",
      })
    } else if (type === "like_reply") {
      const { replyId } = body

      if (!replyId) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply ID is required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.likeReply(replyId)

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply not found",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: result,
        message: "Reply liked successfully",
      })
    } else if (type === "delete_post") {
      const { postId, userEmail } = body

      if (!postId) {
        return NextResponse.json(
          {
            success: false,
            error: "Post ID is required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.deletePost(postId, userEmail || "")

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Post not found or you don't have permission to delete it",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: { deleted: true, postId },
        message: "Post deleted successfully",
      })
    } else if (type === "delete_reply") {
      const { replyId, userEmail } = body

      if (!replyId) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply ID is required",
          },
          { status: 400 },
        )
      }

      const result = await persistentForumDataStore.deleteReply(replyId, userEmail || "")

      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: "Reply not found or you don't have permission to delete it",
          },
          { status: 404 },
        )
      }

      return NextResponse.json({
        success: true,
        data: { deleted: true, replyId },
        message: "Reply deleted successfully",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request type",
        },
        { status: 400 },
      )
    }
  } catch (error) {
    console.error("❌ Error in forum API POST:", error)
    return NextResponse.json(
      {
        success: false,
        error: `An error occurred: ${error instanceof Error ? error.message : "Unknown error"}`,
      },
      { status: 500 },
    )
  }
}
